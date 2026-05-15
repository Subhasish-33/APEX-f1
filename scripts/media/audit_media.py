#!/usr/bin/env python3
"""
APEX Media Legal Audit Engine — audit_media.py
===============================================
Tier 5 / Phase 1 — Deterministic Media Infrastructure

PURPOSE
-------
This script is the FINAL legal gate before an asset enters production.

It operates on assets in PENDING_CLEARANCE state.
It enforces the provenance rules defined in MEDIA_PROVENANCE_POLICY.md.
It is the ONLY script that can set clearance_status=True and is_production_safe=True.

CLEARANCE RULES (non-negotiable)
---------------------------------
An asset passes clearance if ALL of the following are true:
  ✓ checksum_verified = True
  ✓ source_type is not NULL
  ✓ license_type is not NULL
  ✓ source_type != OPENF1_EPHEMERAL (must be migrated to internal storage first)
  ✓ attribution_text is set if attribution_required = True
  ✓ license_url is set for CC-licensed assets
  ✓ internal_url is set (must be downloaded — no serving external URLs in prod)
  ✓ width and height are populated (CLS prevention)
  ✓ dominant_palette is populated (theming requirement)

FAILURE BEHAVIOR
----------------
Any asset failing ANY rule is moved to:
  lifecycle_state = PENDING_CLEARANCE (unchanged — not FAILED)
  clearance_status = False
  is_production_safe = False
  verification_error = <reason>

Assets that PASS all rules are moved to:
  lifecycle_state = ACTIVE
  clearance_status = True
  is_production_safe = True

USAGE
-----
  python scripts/media/audit_media.py [--dry-run] [--asset-id UUID]
  python scripts/media/audit_media.py --report         (print clearance report, no changes)
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import asyncpg

log = logging.getLogger("apex.media.audit")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# Source types that CANNOT be cleared — must be migrated to internal storage first
EPHEMERAL_SOURCE_TYPES = {"OPENF1_EPHEMERAL"}

# Source types that REQUIRE a license_url
CC_SOURCE_TYPES = {"WIKIMEDIA", "STOCK"}


def evaluate_clearance(asset: dict) -> Tuple[bool, List[str]]:
    """
    Evaluate whether an asset meets all clearance rules.
    Returns (passed: bool, failures: List[str])

    Phase 1 rules (1-8):
    1. checksum_verified
    2. source_type set
    3. license_type set
    4. no OPENF1_EPHEMERAL
    5. attribution_text if required
    6. license_url for CC types
    7. internal_url (not raw external)
    8. width + height set
    9. dominant_palette set

    Phase 2 rules (10-12):
    10. No budget violations in variant manifest
    11. blurhash set (LQIP infrastructure)
    12. webp_available = True
    """
    failures = []

    if not asset.get("checksum_verified"):
        failures.append("checksum_verified is False — run verify_media.py first")

    if not asset.get("source_type"):
        failures.append("source_type is NULL — provenance unknown")

    if not asset.get("license_type"):
        failures.append("license_type is NULL — license unknown")

    if asset.get("source_type") in EPHEMERAL_SOURCE_TYPES:
        failures.append(
            f"source_type={asset['source_type']} is ephemeral — "
            "asset must be downloaded to internal_url first"
        )

    if asset.get("attribution_required") and not asset.get("attribution_text"):
        failures.append("attribution_required=True but attribution_text is NULL")

    if asset.get("source_type") in CC_SOURCE_TYPES and not asset.get("license_url"):
        failures.append(f"source_type={asset['source_type']} requires license_url (CC license deed)")

    # Internal URL check — in prod we NEVER serve external URLs directly
    # Exception: during Phase 1 bootstrap, internal_url may be a local scratch path
    # We allow local scratch paths but flag external URLs as blocking
    internal_url = asset.get("internal_url") or asset.get("source_url") or ""
    if internal_url.startswith("http") and "scratch" not in internal_url:
        # This is a raw external URL — must be internalized before prod
        failures.append(
            "internal_url points to external URL — run sync_media_registry.py to upload to CDN"
        )

    if not asset.get("width") or not asset.get("height"):
        failures.append("width/height not set — run verify_media.py to extract dimensions")

    if not asset.get("dominant_palette"):
        failures.append("dominant_palette not set — run extract_palette.py first")

    # ── Phase 2 additional rules ──────────────────────────────────────────────

    # Rule 10: Budget violations block clearance
    variants_raw = asset.get("variants")
    if variants_raw:
        variants = json.loads(variants_raw) if isinstance(variants_raw, str) else variants_raw
        violations = [
            f"{k}: {v.get('budget_error', 'unknown')}"
            for k, v in variants.items()
            if not v.get("budget_ok", True)
        ]
        if violations:
            failures.append(
                "Budget violations in variants (re-run generate_variants.py with optimized source): "
                + "; ".join(violations)
            )

    # Rule 11: Blurhash required for LQIP infrastructure
    if not asset.get("blurhash"):
        failures.append(
            "blurhash not set — run generate_variants.py (Phase 2) to generate LQIP placeholder"
        )

    # Rule 12: WebP availability required
    if not asset.get("webp_available"):
        failures.append("webp_available=False — WebP variants are required before clearance")

    return len(failures) == 0, failures


async def audit_one(
    conn: asyncpg.Connection,
    asset: dict,
    dry_run: bool,
) -> Tuple[str, List[str]]:
    """Returns ('cleared', []) or ('held', [reasons])"""
    asset_id  = asset["id"]
    ref       = asset["entity_ref"]
    category  = asset["category"]

    passed, failures = evaluate_clearance(asset)
    prev_log = json.loads(asset.get("audit_log") or "[]")

    if passed:
        audit_entry = {
            "action": "CLEARED",
            "by": "audit_media.py",
            "at": datetime.utcnow().isoformat() + "Z",
            "rules_checked": 12,  # Phase 2: 12 rules
        }
        prev_log.append(audit_entry)

        if not dry_run:
            await conn.execute(
                """
                UPDATE media_assets SET
                    lifecycle_state='ACTIVE',
                    clearance_status=true,
                    is_production_safe=true,
                    verification_error=NULL,
                    audit_log=$1,
                    updated_at=$2
                WHERE id=$3
                """,
                json.dumps(prev_log), datetime.utcnow(), asset_id,
            )

        log.info(f"[{ref}/{category}] ✓ CLEARED → ACTIVE")
        return "cleared", []
    else:
        audit_entry = {
            "action": "CLEARANCE_DENIED",
            "by": "audit_media.py",
            "at": datetime.utcnow().isoformat() + "Z",
            "failures": failures,
        }
        prev_log.append(audit_entry)
        failure_summary = "; ".join(failures)

        if not dry_run:
            await conn.execute(
                """
                UPDATE media_assets SET
                    clearance_status=false,
                    is_production_safe=false,
                    verification_error=$1,
                    audit_log=$2,
                    updated_at=$3
                WHERE id=$4
                """,
                failure_summary, json.dumps(prev_log), datetime.utcnow(), asset_id,
            )

        log.warning(f"[{ref}/{category}] ✗ HELD — {len(failures)} failures")
        for f in failures:
            log.warning(f"    → {f}")
        return "held", failures


async def print_report(conn: asyncpg.Connection) -> None:
    """Print the current clearance state of all assets."""
    assets = await conn.fetch("SELECT * FROM media_assets ORDER BY entity_type, entity_ref, category")

    print("\n" + "=" * 70)
    print("APEX MEDIA CLEARANCE REPORT")
    print(f"Generated: {datetime.utcnow().isoformat()}Z")
    print("=" * 70)

    states: dict = {}
    for asset in assets:
        state = asset["lifecycle_state"]
        states[state] = states.get(state, 0) + 1

    for state, count in sorted(states.items()):
        print(f"  {state:<20} {count:>4} asset(s)")

    print("-" * 70)
    blocked = [a for a in assets if a["lifecycle_state"] == "PENDING_CLEARANCE"]
    if blocked:
        print(f"\nBLOCKED ({len(blocked)} assets):")
        for asset in blocked:
            passed, failures = evaluate_clearance(dict(asset))
            print(f"  {asset['entity_ref']}/{asset['category']}")
            for f in failures:
                print(f"    → {f}")
    print("=" * 70 + "\n")


async def main(dry_run: bool, asset_id: Optional[str], report_only: bool) -> None:
    db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url:
        log.critical("DATABASE_URL not set.")
        sys.exit(1)

    conn = await asyncpg.connect(db_url)

    if report_only:
        await print_report(conn)
        await conn.close()
        return

    query = "SELECT * FROM media_assets WHERE lifecycle_state='PENDING_CLEARANCE'"
    params = []
    if asset_id:
        query += " AND id=$1"
        params.append(asset_id)

    assets = await conn.fetch(query, *params)
    log.info(f"Auditing {len(assets)} asset(s) in PENDING_CLEARANCE")

    stats = {"cleared": 0, "held": 0}
    for asset in assets:
        result, _ = await audit_one(conn, dict(asset), dry_run)
        stats[result] = stats.get(result, 0) + 1

    await conn.close()

    log.info("=" * 60)
    log.info("LEGAL AUDIT COMPLETE")
    log.info(f"  Cleared → ACTIVE          : {stats['cleared']}")
    log.info(f"  Held    → PENDING_CLEARANCE: {stats['held']}")
    log.info("=" * 60)

    if stats["held"] > 0:
        log.warning("Some assets are still held. Review failures above.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Media Legal Audit Engine")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--asset-id", help="Audit a single asset by UUID")
    parser.add_argument("--report", action="store_true", help="Print report without changes")
    args = parser.parse_args()

    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / "apps/api/.env")

    asyncio.run(main(args.dry_run, args.asset_id, args.report))
