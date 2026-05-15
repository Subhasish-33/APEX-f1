#!/usr/bin/env python3
"""
APEX Media Palette Extractor — extract_palette.py
==================================================
Tier 5 / Phase 1 — Deterministic Media Infrastructure

PURPOSE
-------
Extracts the dominant color palette from every ACTIVE or PENDING_CLEARANCE
asset and stores it in the dominant_palette JSON column.

This data is consumed by the frontend to:
- Theme driver profile backgrounds
- Generate team-color CSS glows
- Set gradient overlays on card components
- Avoid runtime color extraction (perf)

COLOR SLOTS (stored in dominant_palette JSON)
  vibrant   — Most saturated prominent color (e.g. #E10600 Ferrari red)
  dark      — Darkest prominent shade (e.g. #15151E F1 background)
  muted     — Desaturated version of vibrant (for text-safe backgrounds)
  light     — Lightest prominent color (for text contrast)

ALGORITHM
---------
Uses k-means quantization via Pillow's quantize() method.
Extracts top 8 colors from a 150×150 downscaled version (perf).
Maps to HSL space to label vibrant/dark/muted/light buckets.

IDEMPOTENCY
-----------
Only processes assets where dominant_palette IS NULL.
Pass --force to re-extract all.

USAGE
-----
  python scripts/media/extract_palette.py [--dry-run] [--force] [--asset-id UUID]
"""

import argparse
import asyncio
import colorsys
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import asyncpg

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

log = logging.getLogger("apex.media.palette")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02X}{g:02X}{b:02X}"


def get_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """Returns (hue 0-1, saturation 0-1, lightness 0-1)."""
    return colorsys.rgb_to_hls(r / 255, g / 255, b / 255)


def label_palette(colors: List[Tuple[int, int, int, int]]) -> Dict[str, str]:
    """
    Given a list of (r, g, b, count) tuples sorted by count,
    label them into vibrant / dark / muted / light slots.
    """
    if not colors:
        return {}

    labeled: Dict[str, Optional[str]] = {"vibrant": None, "dark": None, "muted": None, "light": None}

    sorted_by_saturation = sorted(
        colors, key=lambda c: get_hsl(c[0], c[1], c[2])[1], reverse=True
    )
    sorted_by_lightness  = sorted(
        colors, key=lambda c: get_hsl(c[0], c[1], c[2])[2]
    )

    # Vibrant: highest saturation
    r, g, b, _ = sorted_by_saturation[0]
    labeled["vibrant"] = rgb_to_hex(r, g, b)

    # Dark: lowest lightness
    r, g, b, _ = sorted_by_lightness[0]
    labeled["dark"] = rgb_to_hex(r, g, b)

    # Light: highest lightness
    r, g, b, _ = sorted_by_lightness[-1]
    labeled["light"] = rgb_to_hex(r, g, b)

    # Muted: medium saturation, medium lightness
    muted_candidates = [
        c for c in colors
        if 0.2 < get_hsl(c[0], c[1], c[2])[1] < 0.6
        and 0.3 < get_hsl(c[0], c[1], c[2])[2] < 0.7
    ]
    if muted_candidates:
        r, g, b, _ = muted_candidates[0]
        labeled["muted"] = rgb_to_hex(r, g, b)
    else:
        labeled["muted"] = labeled["vibrant"]

    return {k: v for k, v in labeled.items() if v}


def extract_palette_from_path(src_path: Path) -> Optional[Dict[str, str]]:
    """Extract dominant palette from an image file."""
    if not PIL_AVAILABLE:
        return None

    try:
        with Image.open(src_path) as img:
            # Convert to RGB — drop alpha for quantization
            img = img.convert("RGB")
            # Scale down for performance
            img.thumbnail((150, 150), Image.LANCZOS)
            # Quantize to 8 dominant colors
            quantized = img.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
            palette_raw = quantized.getpalette()[:8 * 3]
            count_map = quantized.getcolors(maxcolors=8) or []

            colors_with_count = []
            for count, idx in count_map:
                r = palette_raw[idx * 3]
                g = palette_raw[idx * 3 + 1]
                b = palette_raw[idx * 3 + 2]
                colors_with_count.append((r, g, b, count))

            colors_with_count.sort(key=lambda c: c[3], reverse=True)
            return label_palette(colors_with_count)

    except Exception as e:
        log.error(f"Palette extraction failed for {src_path}: {e}")
        return None


async def process_asset(
    conn: asyncpg.Connection,
    asset: dict,
    force: bool,
    dry_run: bool,
) -> str:
    asset_id = asset["id"]
    ref      = asset["entity_ref"]
    category = asset["category"]

    if not force and asset.get("dominant_palette"):
        return "skipped"

    # Find source file
    scratch = Path("scratch/media_downloads")
    candidates = list(scratch.rglob(f"{ref}_{category.lower()}.*"))

    # Also check variant blur as proxy (small, fast to read)
    if not candidates:
        blur_candidates = list(
            Path("scratch/media_variants").rglob(f"*/{ref}/{category.lower()}/blur.webp")
        )
        candidates = blur_candidates

    if not candidates:
        log.warning(f"[{ref}/{category}] No source file found — skipping palette extraction")
        return "skipped"

    src_path = candidates[0]
    palette = extract_palette_from_path(src_path)

    if not palette:
        log.warning(f"[{ref}/{category}] Palette extraction returned empty")
        return "skipped"

    if dry_run:
        log.info(f"[DRY-RUN] {ref}/{category} → palette={palette}")
        return "extracted"

    prev_log = json.loads(asset.get("audit_log") or "[]")
    prev_log.append({
        "action": "PALETTE_EXTRACTED",
        "by": "extract_palette.py",
        "at": datetime.utcnow().isoformat() + "Z",
        "palette": palette,
    })

    await conn.execute(
        "UPDATE media_assets SET dominant_palette=$1, audit_log=$2, updated_at=$3 WHERE id=$4",
        json.dumps(palette), json.dumps(prev_log), datetime.utcnow(), asset_id,
    )

    log.info(f"[{ref}/{category}] Palette → {palette}")
    return "extracted"


async def main(dry_run: bool, force: bool, asset_id: Optional[str]) -> None:
    db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url:
        log.critical("DATABASE_URL not set.")
        sys.exit(1)

    conn = await asyncpg.connect(db_url)

    query = "SELECT * FROM media_assets WHERE lifecycle_state IN ('PENDING_CLEARANCE','ACTIVE')"
    params = []
    if not force:
        query += " AND dominant_palette IS NULL"
    if asset_id:
        query += f" AND id=${len(params)+1}"
        params.append(asset_id)

    assets = await conn.fetch(query, *params)
    log.info(f"Extracting palette for {len(assets)} asset(s)")

    stats = {"extracted": 0, "skipped": 0}
    for asset in assets:
        result = await process_asset(conn, dict(asset), force, dry_run)
        stats[result] = stats.get(result, 0) + 1

    await conn.close()

    log.info("=" * 60)
    log.info("PALETTE EXTRACTION COMPLETE")
    log.info(f"  Extracted : {stats['extracted']}")
    log.info(f"  Skipped   : {stats['skipped']}")
    log.info("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Media Palette Extractor")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true", help="Re-extract all palettes")
    parser.add_argument("--asset-id", help="Process a single asset by UUID")
    args = parser.parse_args()

    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / "apps/api/.env")

    asyncio.run(main(args.dry_run, args.force, args.asset_id))
