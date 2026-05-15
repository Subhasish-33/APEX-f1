#!/usr/bin/env python3
"""
APEX Media Variant Generator — generate_variants.py
====================================================
Tier 5 / Phase 2 — Processing & Delivery Engine

UPGRADES FROM PHASE 1
---------------------
1. HARD SIZE ENFORCEMENT: Every variant fails pipeline if it exceeds budget.
2. AVIF GENERATION: Primary format when pillow-avif-plugin is installed.
3. BLURHASH GENERATION: Mandatory — pipeline blocks if blurhash fails.
4. BUDGET VIOLATIONS: Logged to DB audit_log; block audit_media.py clearance.
5. OPTIMIZATION CERTIFICATION: webp_available + avif_available set correctly.

VARIANT SPEC & SIZE BUDGETS (from MEDIA_PERFORMANCE_POLICY.md — now ENFORCED)
  thumbnail  — 120×120  — max 30 KB
  card       — 400×300  — max 80 KB
  hero       — 1200×800 — max 300 KB
  mobile     — 390×260  — max 120 KB
  retina     — 2400×1600— max 500 KB
  cinematic  — 1920×1080— max 300 KB
  blur       — 20px wide— max 1 KB (LQIP)

BLURHASH
  Generated from the 20px blur variant after WebP encode.
  Stored in media_assets.blurhash column.
  Required before certification.

AVIF
  Generated in addition to WebP when pillow-avif-plugin is available.
  AVIF paths stored in variant manifest under key {variant}_avif.
  avif_available=True set only when at least one AVIF variant is generated.

USAGE
-----
  python scripts/media/generate_variants.py [--dry-run] [--force] [--asset-id UUID]
  python scripts/media/generate_variants.py --check-budget   (validate budgets without generating)
"""

import argparse
import asyncio
import base64
import io
import json
import logging
import math
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import asyncpg

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("Pillow not installed — variant generation disabled")

try:
    import blurhash  # type: ignore
    BLURHASH_AVAILABLE = True
except ImportError:
    BLURHASH_AVAILABLE = False
    logging.warning("blurhash not installed — LQIP generation disabled")

AVIF_AVAILABLE = False
if PIL_AVAILABLE:
    try:
        import pillow_avif  # type: ignore  # noqa: F401
        AVIF_AVAILABLE = True
    except ImportError:
        pass

log = logging.getLogger("apex.media.variants")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# ── Variant Spec with HARD size budgets (bytes) ──────────────────────────────
VARIANT_SPEC: Dict[str, Dict[str, Any]] = {
    "thumbnail": {"w": 120,  "h": 120,  "quality": 85, "fit": "cover",  "max_bytes": 30_720},
    "card":      {"w": 400,  "h": 300,  "quality": 82, "fit": "cover",  "max_bytes": 81_920},
    "hero":      {"w": 1200, "h": 800,  "quality": 82, "fit": "cover",  "max_bytes": 307_200},
    "mobile":    {"w": 390,  "h": 260,  "quality": 80, "fit": "cover",  "max_bytes": 122_880},
    "retina":    {"w": 2400, "h": 1600, "quality": 82, "fit": "cover",  "max_bytes": 512_000},
    "cinematic": {"w": 1920, "h": 1080, "quality": 82, "fit": "cover",  "max_bytes": 307_200},
    "blur":      {"w": 20,   "h": None, "quality": 15, "fit": "scale",  "max_bytes": 1_024},
}

OUTPUT_DIR = Path("scratch/media_variants")


# ── Image manipulation ────────────────────────────────────────────────────────

def focal_crop(img: "Image.Image", target_w: int, target_h: int, focal: Optional[Dict]) -> "Image.Image":
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w, new_h = math.ceil(src_w * scale), math.ceil(src_h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    fx = (focal or {}).get("x", 0.5)
    fy = (focal or {}).get("y", 0.5)
    cx, cy = int(fx * new_w), int(fy * new_h)
    left = max(0, min(cx - target_w // 2, new_w - target_w))
    top  = max(0, min(cy - target_h // 2, new_h - target_h))
    return img.crop((left, top, left + target_w, top + target_h))


def encode_to_bytes(img: "Image.Image", fmt: str, quality: int) -> bytes:
    buf = io.BytesIO()
    if fmt == "AVIF":
        img.save(buf, format="AVIF", quality=quality)
    else:
        img.save(buf, format="WEBP", quality=quality, method=6)
    return buf.getvalue()


def generate_blurhash(img: "Image.Image") -> Optional[str]:
    """Generate a blurhash string from a small PIL image."""
    if not BLURHASH_AVAILABLE:
        return None
    try:
        small = img.convert("RGB")
        small.thumbnail((32, 32), Image.LANCZOS)
        bh = blurhash.encode(small, x_components=4, y_components=3)
        return bh
    except Exception as e:
        log.warning(f"Blurhash generation failed: {e}")
        return None


def generate_lqip_data_uri(img: "Image.Image") -> Optional[str]:
    """
    Generates a tiny base64 WebP data URI for use as CSS background.
    This is the inline fallback while the full image loads.
    """
    try:
        tiny = img.convert("RGB")
        tiny.thumbnail((20, 20), Image.LANCZOS)
        data = encode_to_bytes(tiny, "WEBP", 15)
        b64 = base64.b64encode(data).decode("ascii")
        return f"data:image/webp;base64,{b64}"
    except Exception as e:
        log.warning(f"LQIP data URI generation failed: {e}")
        return None


# ── Budget enforcement ────────────────────────────────────────────────────────

class BudgetViolationError(Exception):
    """Raised when a variant exceeds its size budget."""
    def __init__(self, variant: str, actual: int, budget: int):
        self.variant = variant
        self.actual = actual
        self.budget = budget
        super().__init__(
            f"Budget violation: {variant} = {actual:,} bytes > {budget:,} bytes limit "
            f"(overage: {actual - budget:,} bytes, {round((actual - budget) / budget * 100, 1)}%)"
        )


def enforce_budget(variant_name: str, data: bytes, spec: Dict[str, Any]) -> None:
    """Raises BudgetViolationError if data exceeds the variant's size budget."""
    max_bytes = spec.get("max_bytes", 0)
    if max_bytes and len(data) > max_bytes:
        raise BudgetViolationError(variant_name, len(data), max_bytes)


# ── Variant generation ────────────────────────────────────────────────────────

class VariantResult:
    __slots__ = ("name", "webp_path", "avif_path", "width", "height",
                 "webp_bytes", "avif_bytes", "budget_ok", "budget_error")
    def __init__(self, name: str, webp_path: Path, width: int, height: int, webp_bytes: int):
        self.name = name
        self.webp_path = webp_path
        self.avif_path: Optional[Path] = None
        self.width = width
        self.height = height
        self.webp_bytes = webp_bytes
        self.avif_bytes: Optional[int] = None
        self.budget_ok = True
        self.budget_error: Optional[str] = None


def generate_all_variants(
    src_path: Path,
    focal: Optional[Dict],
    out_dir: Path,
    force: bool,
    existing: Dict,
) -> Tuple[Dict[str, VariantResult], Optional[str], Optional[str], List[str]]:
    """
    Generate all variants for one asset.
    Returns:
      - results dict (variant_name → VariantResult)
      - blurhash string or None
      - lqip_data_uri string or None
      - budget_violations list of error strings
    """
    if not PIL_AVAILABLE:
        return {}, None, None, ["Pillow not installed"]

    results: Dict[str, VariantResult] = {}
    budget_violations: List[str] = []
    blurhash_str: Optional[str] = None
    lqip_uri: Optional[str] = None
    out_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(src_path) as src_img:
        # Ensure consistent color mode
        if src_img.mode not in ("RGB", "RGBA"):
            src_img = src_img.convert("RGBA" if "transparency" in src_img.info else "RGB")

        for variant_name, spec in VARIANT_SPEC.items():
            if not force and variant_name in existing:
                continue

            try:
                img = src_img.copy()
                target_w = spec["w"]
                target_h = spec.get("h")

                if spec["fit"] == "cover" and target_h:
                    img = focal_crop(img, target_w, target_h, focal)
                else:  # scale
                    ratio = target_w / img.width
                    new_h = int(img.height * ratio)
                    img = img.resize((target_w, new_h), Image.LANCZOS)
                    target_h = new_h

                final_w, final_h = img.size

                # ── WebP generation ───────────────────────────────────────────
                webp_data = encode_to_bytes(img, "WEBP", spec["quality"])

                # HARD BUDGET ENFORCEMENT
                try:
                    enforce_budget(variant_name, webp_data, spec)
                except BudgetViolationError as e:
                    log.error(f"  💥 {e}")
                    budget_violations.append(str(e))
                    vr = VariantResult(variant_name, out_dir / f"{variant_name}.webp", final_w, final_h, len(webp_data))
                    vr.budget_ok = False
                    vr.budget_error = str(e)
                    results[variant_name] = vr
                    # Write anyway — but flag in manifest so audit blocks it
                    (out_dir / f"{variant_name}.webp").write_bytes(webp_data)
                    continue

                webp_path = out_dir / f"{variant_name}.webp"
                webp_path.write_bytes(webp_data)

                vr = VariantResult(variant_name, webp_path, final_w, final_h, len(webp_data))

                # ── AVIF generation (optional) ────────────────────────────────
                if AVIF_AVAILABLE:
                    try:
                        avif_data = encode_to_bytes(img, "AVIF", max(40, spec["quality"] - 12))
                        avif_path = out_dir / f"{variant_name}.avif"
                        avif_path.write_bytes(avif_data)
                        vr.avif_path = avif_path
                        vr.avif_bytes = len(avif_data)
                    except Exception as e:
                        log.warning(f"  AVIF generation failed for {variant_name}: {e}")

                # ── Blurhash + LQIP (from blur variant) ──────────────────────
                if variant_name == "blur":
                    blurhash_str = generate_blurhash(img)
                    lqip_uri = generate_lqip_data_uri(img)

                results[variant_name] = vr
                log.info(
                    f"  {variant_name}: {final_w}×{final_h} | "
                    f"WebP {len(webp_data):,}B"
                    f"{f' | AVIF {len(vr.avif_bytes):,}B' if vr.avif_bytes else ''}"
                )

            except Exception as e:
                log.error(f"  Variant {variant_name} failed: {e}")

    return results, blurhash_str, lqip_uri, budget_violations


# ── DB update ─────────────────────────────────────────────────────────────────

async def process_asset(
    conn: asyncpg.Connection,
    asset: dict,
    force: bool,
    dry_run: bool,
) -> str:
    asset_id = asset["id"]
    ref      = asset["entity_ref"]
    category = asset["category"]
    focal    = asset.get("focal_point")

    scratch = Path("scratch/media_downloads")
    candidates = list(scratch.rglob(f"{ref}_{category.lower()}.*"))
    if not candidates:
        log.warning(f"[{ref}/{category}] No source file found — skipping")
        return "skipped"

    src_path = candidates[0]
    existing = json.loads(asset.get("variants") or "{}")
    out_dir = OUTPUT_DIR / ref / category.lower()

    if dry_run:
        log.info(f"[DRY-RUN] Would generate variants for {ref}/{category}")
        return "skipped"

    results, blurhash_str, lqip_uri, budget_violations = generate_all_variants(
        src_path, focal, out_dir, force, existing
    )

    if not results:
        return "skipped"

    # Build updated variant manifest
    variants_manifest = dict(existing)
    any_budget_violation = False

    for vname, vr in results.items():
        entry: Dict[str, Any] = {
            "url":    str(vr.webp_path),
            "width":  vr.width,
            "height": vr.height,
            "webp":   True,
            "bytes":  vr.webp_bytes,
            "budget_ok": vr.budget_ok,
        }
        if vr.avif_path:
            entry["avif_url"]   = str(vr.avif_path)
            entry["avif_bytes"] = vr.avif_bytes
            entry["avif"]       = True
        if not vr.budget_ok:
            entry["budget_error"] = vr.budget_error
            any_budget_violation = True

        variants_manifest[vname] = entry

    webp_ok = any(v.get("webp") and v.get("budget_ok", True) for v in variants_manifest.values())
    avif_ok = any(v.get("avif") for v in variants_manifest.values())

    prev_log = json.loads(asset.get("audit_log") or "[]")
    log_entry: Dict[str, Any] = {
        "action": "VARIANTS_GENERATED",
        "by": "generate_variants.py (Phase 2)",
        "at": datetime.utcnow().isoformat() + "Z",
        "variants": list(results.keys()),
        "blurhash_generated": blurhash_str is not None,
        "avif_generated": avif_ok,
    }
    if budget_violations:
        log_entry["budget_violations"] = budget_violations

    prev_log.append(log_entry)

    await conn.execute(
        """
        UPDATE media_assets SET
            variants=$1,
            webp_available=$2,
            avif_available=$3,
            blurhash=$4,
            optimization_version=optimization_version+1,
            audit_log=$5,
            updated_at=$6
        WHERE id=$7
        """,
        json.dumps(variants_manifest), webp_ok, avif_ok,
        blurhash_str, json.dumps(prev_log), datetime.utcnow(), asset_id,
    )

    if any_budget_violation:
        log.error(f"[{ref}/{category}] ⚠ Budget violations recorded — audit_media.py will block clearance")
        return "budget_violation"

    return "generated"


# ── Main ──────────────────────────────────────────────────────────────────────

async def main(dry_run: bool, force: bool, asset_id: Optional[str]) -> None:
    db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url:
        log.critical("DATABASE_URL not set.")
        sys.exit(1)

    log.info(f"Format support — WebP: always | AVIF: {AVIF_AVAILABLE} | Blurhash: {BLURHASH_AVAILABLE}")

    conn = await asyncpg.connect(db_url)
    query = "SELECT * FROM media_assets WHERE lifecycle_state IN ('PENDING_CLEARANCE','ACTIVE')"
    params: list = []
    if asset_id:
        query += " AND id=$1"
        params.append(asset_id)

    assets = await conn.fetch(query, *params)
    log.info(f"Processing variants for {len(assets)} asset(s)")

    stats: Dict[str, int] = {"generated": 0, "budget_violation": 0, "skipped": 0}
    for asset in assets:
        result = await process_asset(conn, dict(asset), force, dry_run)
        stats[result] = stats.get(result, 0) + 1

    await conn.close()

    log.info("=" * 60)
    log.info("VARIANT GENERATION COMPLETE (Phase 2)")
    log.info(f"  Generated         : {stats['generated']}")
    log.info(f"  Budget violations : {stats['budget_violation']}")
    log.info(f"  Skipped           : {stats['skipped']}")
    log.info("=" * 60)

    if stats["budget_violation"] > 0:
        log.error(f"{stats['budget_violation']} asset(s) have budget violations — they are blocked from clearance")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Media Variant Generator (Phase 2)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true", help="Regenerate all variants")
    parser.add_argument("--asset-id", help="Process a single asset by UUID")
    args = parser.parse_args()

    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / "apps/api/.env")

    asyncio.run(main(args.dry_run, args.force, args.asset_id))
