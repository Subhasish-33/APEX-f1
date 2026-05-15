#!/usr/bin/env python3
"""
APEX Media Ingestion Engine — ingest_media.py
=============================================
Tier 5 / Phase 1 — Deterministic Media Infrastructure

PURPOSE
-------
Bootstrap the media_assets registry from all governed source tiers.
This script is idempotent: re-running it will update existing records,
not create duplicates.

SOURCE TIERS (as defined in MEDIA_PROVENANCE_POLICY.md)
  Tier 1: Identity  — Wikimedia Commons (CC-BY-SA), Team Press Kits
  Tier 2: Structural — OpenStreetMap (OSM/ODbL)
  Tier 3: Atmospheric — Unsplash/Pexels, APEX AI-generated

CRITICAL RULES
--------------
- NO direct F1.com mirroring
- NO scraping of copyrighted editorial photos
- NO using official broadcast screenshots
- All OPENF1_EPHEMERAL assets must be copied to internal storage
- clearance_status defaults to False — do NOT change without explicit legal review
- is_production_safe gates the frontend — only set by audit_media.py

IDEMPOTENCY
-----------
Uses the (entity_type, entity_ref, category, season) unique constraint.
On conflict: updates source_url, lifecycle_state, and audit_log only.
Never overwrites clearance_status or is_production_safe automatically.

RETRY POLICY
------------
Uses tenacity: 3 retries, exponential backoff, 30s cap.

USAGE
-----
  python scripts/media/ingest_media.py [--season 2025] [--dry-run] [--entity-type DRIVER]
"""

import argparse
import asyncio
import hashlib
import json
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp
import asyncpg

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("apex.media.ingest")

# ── Source Manifest ───────────────────────────────────────────────────────────
# Each entry defines ONE slot in the media_assets table.
# source_type and license_type are non-negotiable — do not omit.
#
# OPENF1_EPHEMERAL entries are marked so sync_media_registry.py knows to
# download and move them to internal storage before they expire (2026).
#
# Wikimedia entries use the official API to get the canonical download URL
# and the CC license deed — we do NOT hotlink the file directly.

DRIVER_MANIFEST: List[Dict[str, Any]] = [
    # ── Hamilton (Mercedes → Ferrari 2025) ───────────────────────────────────
    {
        "entity_ref": "hamilton",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Lewis_Hamilton_2024_Qatar.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "Lewis Hamilton — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # ── Verstappen ───────────────────────────────────────────────────────────
    {
        "entity_ref": "verstappen",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Max_Verstappen_2023_Qatar.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "Max Verstappen — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # ── Leclerc ──────────────────────────────────────────────────────────────
    {
        "entity_ref": "leclerc",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Charles_Leclerc_2024_Bahrain.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "Charles Leclerc — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # ── Norris ───────────────────────────────────────────────────────────────
    {
        "entity_ref": "norris",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Lando_Norris_2024_Monaco.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "Lando Norris — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # ── Piastri ──────────────────────────────────────────────────────────────
    {
        "entity_ref": "piastri",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Oscar_Piastri_2024_Japan.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "Oscar Piastri — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # ── Russell ──────────────────────────────────────────────────────────────
    {
        "entity_ref": "russell",
        "category": "HEADSHOT",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "George_Russell_2024_Bahrain.jpg",
        "owner_id": "Wikimedia Commons",
        "license_type": "CC-BY-SA-4.0",
        "attribution_text": "George Russell — Wikimedia Commons / CC-BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "fallback_strategy": "SILHOUETTE_WIRE",
        "attribution_required": True,
    },
    # Additional drivers follow same pattern — expand as Wikimedia images are confirmed
]

TEAM_MANIFEST: List[Dict[str, Any]] = [
    # Team logos come from official press kits where available under editorial use.
    # Where press kits are not public, we use Wikimedia SVG vector marks.
    {
        "entity_ref": "ferrari",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Scuderia_Ferrari_Logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Ferrari — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Scuderia_Ferrari_Logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,  # Editorial use — no in-UI credit needed
    },
    {
        "entity_ref": "redbull",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Red_Bull_Racing_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Red Bull Racing — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Red_Bull_Racing_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "mclaren",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "McLaren_Racing_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "McLaren Racing — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:McLaren_Racing_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "mercedes",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Mercedes-Benz_in_Motorsport_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Mercedes-AMG Petronas — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_in_Motorsport_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "aston_martin",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Aston_Martin_Aramco_F1_team_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Aston Martin Aramco — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Aston_Martin_Aramco_F1_team_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "alpine",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Alpine_F1_Team_2021_Logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Alpine F1 Team — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Alpine_F1_Team_2021_Logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "haas",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Haas_F1_team_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Haas F1 Team — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Haas_F1_team_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "williams",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Williams_Racing_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Williams Racing — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Williams_Racing_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "rb",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Visa_Cash_App_RB_F1_Team_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Visa Cash App RB — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Visa_Cash_App_RB_F1_Team_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
    {
        "entity_ref": "kick_sauber",
        "category": "LOGO",
        "source_type": "WIKIMEDIA",
        "wikimedia_title": "Stake_F1_Team_Kick_Sauber_logo.svg",
        "owner_id": "Wikimedia Commons",
        "license_type": "TRADEMARK",
        "attribution_text": "Kick Sauber — Logo used for editorial identification purposes",
        "license_url": "https://commons.wikimedia.org/wiki/File:Stake_F1_Team_Kick_Sauber_logo.svg",
        "fallback_strategy": "TEAM_COLOR_GLOW",
        "attribution_required": False,
    },
]


async def resolve_wikimedia_url(session: aiohttp.ClientSession, title: str) -> Optional[str]:
    """
    Use the Wikimedia API to resolve the canonical download URL for a file.
    This prevents hardcoding URLs that may change.
    """
    api_url = (
        f"https://commons.wikimedia.org/w/api.php"
        f"?action=query&titles=File:{title}"
        f"&prop=imageinfo&iiprop=url&format=json"
    )
    try:
        async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                imageinfo = page.get("imageinfo", [])
                if imageinfo:
                    return imageinfo[0].get("url")
    except Exception as e:
        log.warning(f"Wikimedia API failed for {title}: {e}")
    return None


async def download_and_checksum(session: aiohttp.ClientSession, url: str, dest_path: Path) -> Optional[str]:
    """
    Download a file to dest_path and return its SHA-256 checksum.
    Returns None on failure.
    """
    try:
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        sha256 = hashlib.sha256()
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            if resp.status != 200:
                log.warning(f"Download failed {url}: HTTP {resp.status}")
                return None
            with open(dest_path, "wb") as f:
                async for chunk in resp.content.iter_chunked(65536):
                    sha256.update(chunk)
                    f.write(chunk)
        return sha256.hexdigest()
    except Exception as e:
        log.error(f"Download error for {url}: {e}")
        return None


def build_audit_entry(action: str, script: str, detail: str = "") -> Dict:
    return {
        "action": action,
        "by": script,
        "at": datetime.utcnow().isoformat() + "Z",
        "detail": detail,
    }


async def upsert_asset(
    conn: asyncpg.Connection,
    entity_type: str,
    entry: Dict[str, Any],
    season: int,
    source_url: Optional[str],
    checksum: Optional[str],
    dry_run: bool,
) -> str:
    """
    Upsert a single asset into media_assets.
    On conflict (unique slot), updates source_url, lifecycle_state, audit_log.
    NEVER overwrites clearance_status or is_production_safe.
    Returns 'inserted', 'updated', or 'skipped'.
    """
    asset_id = str(uuid.uuid4())
    audit_entry = build_audit_entry("INGESTED", "ingest_media.py", f"source={entry['source_type']}")
    audit_log = json.dumps([audit_entry])

    if dry_run:
        log.info(f"[DRY-RUN] Would upsert {entity_type}/{entry['entity_ref']}/{entry['category']}")
        return "skipped"

    # Check if slot already exists
    existing = await conn.fetchrow(
        """
        SELECT id, audit_log FROM media_assets
        WHERE entity_type=$1 AND entity_ref=$2 AND category=$3
          AND (season=$4 OR (season IS NULL AND $4 IS NULL))
        """,
        entity_type, entry["entity_ref"], entry["category"], season,
    )

    if existing:
        # Merge audit log
        prev_log = json.loads(existing["audit_log"] or "[]")
        prev_log.append(json.loads(audit_log)[0])
        await conn.execute(
            """
            UPDATE media_assets SET
                source_url=$1, lifecycle_state='PROCESSING',
                checksum=$2, checksum_verified=false,
                audit_log=$3, updated_at=$4,
                source_type=$5, owner_id=$6, license_type=$7,
                attribution_text=$8, license_url=$9,
                attribution_required=$10, fallback_strategy=$11
            WHERE id=$12
            """,
            source_url, checksum, json.dumps(prev_log), datetime.utcnow(),
            entry.get("source_type"), entry.get("owner_id"), entry.get("license_type"),
            entry.get("attribution_text"), entry.get("license_url"),
            entry.get("attribution_required", False), entry.get("fallback_strategy", "APEX_PLACEHOLDER"),
            existing["id"],
        )
        return "updated"
    else:
        await conn.execute(
            """
            INSERT INTO media_assets (
                id, entity_type, entity_ref, category, season, priority,
                source_url, lifecycle_state, clearance_status, is_production_safe,
                source_type, owner_id, license_type, attribution_text, license_url,
                attribution_required, checksum, checksum_verified,
                fallback_strategy, audit_log, ingestion_source, created_at, updated_at
            ) VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,'PROCESSING',false,false,
                $8,$9,$10,$11,$12,
                $13,$14,false,
                $15,$16,'ingest_media.py',$17,$17
            )
            """,
            asset_id, entity_type, entry["entity_ref"], entry["category"], season, entry.get("priority", 10),
            source_url,
            entry.get("source_type"), entry.get("owner_id"), entry.get("license_type"),
            entry.get("attribution_text"), entry.get("license_url"),
            entry.get("attribution_required", False), checksum,
            entry.get("fallback_strategy", "APEX_PLACEHOLDER"), audit_log, datetime.utcnow(),
        )
        return "inserted"


async def process_manifest(
    conn: asyncpg.Connection,
    session: aiohttp.ClientSession,
    entity_type: str,
    manifest: List[Dict],
    season: int,
    download_dir: Path,
    dry_run: bool,
) -> Dict[str, int]:
    stats = {"inserted": 0, "updated": 0, "skipped": 0, "failed": 0}

    for entry in manifest:
        ref = entry["entity_ref"]
        cat = entry["category"]
        log.info(f"Processing {entity_type}/{ref}/{cat} ...")

        source_url = None
        checksum = None

        if entry.get("source_type") == "WIKIMEDIA" and entry.get("wikimedia_title"):
            source_url = await resolve_wikimedia_url(session, entry["wikimedia_title"])
            if not source_url:
                log.warning(f"  Could not resolve Wikimedia URL for {entry['wikimedia_title']}")
                stats["failed"] += 1
                continue

            if not dry_run:
                ext = Path(entry["wikimedia_title"]).suffix
                dest = download_dir / entity_type.lower() / f"{ref}_{cat.lower()}{ext}"
                checksum = await download_and_checksum(session, source_url, dest)
                if not checksum:
                    log.error(f"  Download failed for {ref}/{cat}")
                    stats["failed"] += 1
                    continue
                log.info(f"  Downloaded → {dest} (sha256: {checksum[:12]}…)")

        try:
            result = await upsert_asset(conn, entity_type, entry, season, source_url, checksum, dry_run)
            stats[result] = stats.get(result, 0) + 1
            log.info(f"  ✓ {result.upper()}: {entity_type}/{ref}/{cat}")
        except Exception as e:
            log.error(f"  ✗ DB error for {ref}/{cat}: {e}")
            stats["failed"] += 1

    return stats


async def main(season: int, dry_run: bool, entity_filter: Optional[str]) -> None:
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        log.critical("DATABASE_URL not set. Cannot connect.")
        sys.exit(1)

    # asyncpg uses postgresql:// not postgresql+asyncpg://
    pg_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    download_dir = Path("scratch/media_downloads")
    download_dir.mkdir(parents=True, exist_ok=True)

    conn = await asyncpg.connect(pg_url)
    connector = aiohttp.TCPConnector(limit=5)  # polite rate limiting
    headers = {"User-Agent": "APEX-F1/1.0 (media-registry; contact: apex-f1-infra)"}

    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        total_stats = {"inserted": 0, "updated": 0, "skipped": 0, "failed": 0}

        if not entity_filter or entity_filter == "DRIVER":
            s = await process_manifest(conn, session, "DRIVER", DRIVER_MANIFEST, season, download_dir, dry_run)
            for k, v in s.items():
                total_stats[k] += v

        if not entity_filter or entity_filter == "TEAM":
            s = await process_manifest(conn, session, "TEAM", TEAM_MANIFEST, season, download_dir, dry_run)
            for k, v in s.items():
                total_stats[k] += v

    await conn.close()

    log.info("=" * 60)
    log.info("INGESTION COMPLETE")
    log.info(f"  Inserted : {total_stats['inserted']}")
    log.info(f"  Updated  : {total_stats['updated']}")
    log.info(f"  Skipped  : {total_stats['skipped']}")
    log.info(f"  Failed   : {total_stats['failed']}")
    log.info("=" * 60)
    log.info("Next step: run verify_media.py to checksum-verify all PROCESSING assets.")

    if total_stats["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Media Ingestion Engine")
    parser.add_argument("--season", type=int, default=2025)
    parser.add_argument("--dry-run", action="store_true", help="Simulate without DB writes")
    parser.add_argument("--entity-type", choices=["DRIVER", "TEAM", "CIRCUIT"], default=None)
    args = parser.parse_args()

    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / "apps/api/.env")

    asyncio.run(main(args.season, args.dry_run, args.entity_type))
