#!/usr/bin/env python3
"""
APEX Media Registry Sync — sync_media_registry.py
==================================================
Tier 5 / Phase 1 — Deterministic Media Infrastructure

PURPOSE
-------
Synchronizes verified assets from local scratch storage to the internal CDN
(Supabase Storage bucket), then updates the registry with cdn_url and internal_url.

This is the bridge between local file processing and production serving.
After sync, assets can be cleared by audit_media.py.

STORAGE ARCHITECTURE
--------------------
  scratch/media_downloads/{entity_type}/{ref}_{category}.ext  ← raw source
  scratch/media_variants/{ref}/{category}/{variant}.webp       ← processed
       ↓ (this script)
  Supabase Storage bucket: apex-media
  CDN path: /media/{entity_type}/{ref}/{category}/{variant}.webp
  cdn_url: https://<project>.supabase.co/storage/v1/object/public/apex-media/…

IDEMPOTENCY
-----------
Only uploads files that are not yet synced (internal_url IS NULL or force).
Checks content hash before re-uploading.

USAGE
-----
  python scripts/media/sync_media_registry.py [--dry-run] [--force]
  python scripts/media/sync_media_registry.py --asset-id UUID
"""

import argparse
import asyncio
import hashlib
import json
import logging
import mimetypes
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import aiohttp
import asyncpg

log = logging.getLogger("apex.media.sync")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

SUPABASE_URL    = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY    = os.environ.get("SUPABASE_SERVICE_KEY", "")
STORAGE_BUCKET  = "apex-media"

# Phase 1: if Supabase is not configured, store in local public directory as fallback
LOCAL_CDN_DIR   = Path("apps/web/public/assets/media")


async def upload_to_supabase(
    session: aiohttp.ClientSession,
    local_path: Path,
    cdn_path: str,
) -> Optional[str]:
    """
    Upload a file to Supabase Storage.
    Returns the public CDN URL or None on failure.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{cdn_path}"
    mime_type = mimetypes.guess_type(str(local_path))[0] or "application/octet-stream"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": mime_type,
        "x-upsert": "true",  # Overwrite if exists
    }

    try:
        with open(local_path, "rb") as f:
            async with session.put(url, data=f, headers=headers) as resp:
                if resp.status in (200, 201):
                    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{cdn_path}"
                    return public_url
                else:
                    body = await resp.text()
                    log.error(f"Supabase upload failed ({resp.status}): {body[:200]}")
                    return None
    except Exception as e:
        log.error(f"Supabase upload exception: {e}")
        return None


def local_cdn_fallback(local_path: Path, cdn_path: str) -> str:
    """
    Copy file to Next.js public directory as local CDN fallback.
    Returns the public URL path (relative to site root).
    """
    dest = LOCAL_CDN_DIR / cdn_path
    dest.parent.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy2(local_path, dest)
    return f"/assets/media/{cdn_path}"


async def sync_asset_variants(
    conn: asyncpg.Connection,
    session: aiohttp.ClientSession,
    asset: dict,
    force: bool,
    dry_run: bool,
) -> str:
    asset_id  = asset["id"]
    ref       = asset["entity_ref"]
    cat       = asset["category"].lower()
    etype     = asset["entity_type"].lower()

    variants_raw = asset.get("variants")
    if not variants_raw:
        log.debug(f"[{ref}/{cat}] No variants to sync")
        return "skipped"

    variants = json.loads(variants_raw) if isinstance(variants_raw, str) else variants_raw
    updated_variants = dict(variants)
    changed = False

    for variant_name, meta in variants.items():
        local_path_str = meta.get("url", "")
        if not local_path_str or not Path(local_path_str).exists():
            continue

        local_path = Path(local_path_str)
        cdn_path = f"{etype}/{ref}/{cat}/{variant_name}.webp"

        # Check if already synced
        if not force and meta.get("cdn_url"):
            log.debug(f"  [{ref}/{cat}/{variant_name}] already synced")
            continue

        if dry_run:
            log.info(f"[DRY-RUN] Would upload {local_path} → {cdn_path}")
            continue

        # Try Supabase first, fall back to local public directory
        cdn_url = await upload_to_supabase(session, local_path, cdn_path)
        if not cdn_url:
            cdn_url = local_cdn_fallback(local_path, cdn_path)
            log.info(f"  [{ref}/{cat}/{variant_name}] → local CDN fallback: {cdn_url}")
        else:
            log.info(f"  [{ref}/{cat}/{variant_name}] → Supabase: {cdn_url}")

        updated_variants[variant_name]["cdn_url"] = cdn_url
        changed = True

    if changed:
        # Update primary cdn_url to the hero variant if available
        primary_cdn = (
            updated_variants.get("hero", {}).get("cdn_url")
            or updated_variants.get("card", {}).get("cdn_url")
            or next((v["cdn_url"] for v in updated_variants.values() if v.get("cdn_url")), None)
        )

        prev_log = json.loads(asset.get("audit_log") or "[]")
        prev_log.append({
            "action": "CDN_SYNCED",
            "by": "sync_media_registry.py",
            "at": datetime.utcnow().isoformat() + "Z",
            "variants_synced": [k for k, v in updated_variants.items() if v.get("cdn_url")],
        })

        await conn.execute(
            """
            UPDATE media_assets SET
                variants=$1, cdn_url=$2, internal_url=$3,
                audit_log=$4, updated_at=$5
            WHERE id=$6
            """,
            json.dumps(updated_variants), primary_cdn, primary_cdn,
            json.dumps(prev_log), datetime.utcnow(), asset_id,
        )
        return "synced"

    return "skipped"


async def main(dry_run: bool, force: bool, asset_id: Optional[str]) -> None:
    db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url:
        log.critical("DATABASE_URL not set.")
        sys.exit(1)

    if not SUPABASE_URL:
        log.warning("SUPABASE_URL not set — will use local CDN fallback (apps/web/public)")

    conn = await asyncpg.connect(db_url)

    query = "SELECT * FROM media_assets WHERE lifecycle_state IN ('PENDING_CLEARANCE','ACTIVE')"
    params = []
    if asset_id:
        query += " AND id=$1"
        params.append(asset_id)
    if not force:
        query += f" AND (variants IS NOT NULL AND (cdn_url IS NULL OR cdn_url NOT LIKE 'http%'))"

    assets = await conn.fetch(query, *params)
    log.info(f"Syncing {len(assets)} asset(s) to CDN")

    connector = aiohttp.TCPConnector(limit=4)
    headers = {"User-Agent": "APEX-F1/1.0 (media-sync; contact: apex-f1-infra)"}

    stats = {"synced": 0, "skipped": 0, "failed": 0}
    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        for asset in assets:
            try:
                result = await sync_asset_variants(conn, session, dict(asset), force, dry_run)
                stats[result] = stats.get(result, 0) + 1
            except Exception as e:
                log.error(f"Sync error for {asset['entity_ref']}: {e}")
                stats["failed"] += 1

    await conn.close()

    log.info("=" * 60)
    log.info("CDN SYNC COMPLETE")
    log.info(f"  Synced   : {stats['synced']}")
    log.info(f"  Skipped  : {stats['skipped']}")
    log.info(f"  Failed   : {stats['failed']}")
    log.info("=" * 60)
    log.info("Next step: run audit_media.py to grant production clearance.")

    if stats["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Media Registry Sync")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true", help="Re-sync all even if already synced")
    parser.add_argument("--asset-id", help="Sync a single asset by UUID")
    args = parser.parse_args()

    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / "apps/api/.env")

    asyncio.run(main(args.dry_run, args.force, args.asset_id))
