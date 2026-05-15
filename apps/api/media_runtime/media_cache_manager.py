"""
APEX Media Cache Manager — apps/api/media_runtime/media_cache_manager.py
=========================================================================
Tier 5 / Phase 2 — Delivery Intelligence

PURPOSE
-------
Determines the correct cache policy for every media asset and API response.

Different asset classes require fundamentally different cache strategies:
- A cleared, optimized hero image should be cached for 1 year at the CDN edge.
- A degraded asset serving as a fallback must not be cached at all.
- Race-weekend assets require shorter TTLs due to more frequent asset updates.
- The registry API itself needs stale-while-revalidate for hot-path performance.

CACHE TIERS
-----------
  TIER_IMMUTABLE  — 1 year  (ACTIVE + optimized + versioned)
  TIER_LONG       — 7 days  (ACTIVE + recent)
  TIER_MEDIUM     — 1 hour  (ACTIVE + unversioned or race weekend)
  TIER_SHORT      — 5 min   (PENDING_CLEARANCE / degraded)
  TIER_NO_CACHE   — 0       (FAILED / PROCESSING / safety=false)
  TIER_API        — 30s SWR (registry status endpoints)

CACHE-CONTROL HEADERS EMITTED
------------------------------
  TIER_IMMUTABLE: Cache-Control: public, max-age=31536000, immutable
  TIER_LONG:      Cache-Control: public, max-age=604800, stale-while-revalidate=86400
  TIER_MEDIUM:    Cache-Control: public, max-age=3600, stale-while-revalidate=300
  TIER_SHORT:     Cache-Control: public, max-age=300, stale-while-revalidate=60
  TIER_NO_CACHE:  Cache-Control: no-cache, no-store, must-revalidate
  TIER_API:       Cache-Control: public, max-age=30, stale-while-revalidate=30

INVALIDATION
------------
Cache invalidation is triggered by incrementing optimization_version.
The CDN path must include the version: /media/{ref}/{cat}/{version}/{variant}.webp
When optimization_version is bumped, old URLs become stale naturally
(they are different paths) — no active purge required.

LOCAL STORAGE PRUNING
---------------------
Local fallback files (apps/web/public/assets/media/) must be pruned when:
1. The CDN URL is confirmed active (sync_media_registry.py sets cdn_url).
2. The asset lifecycle_state transitions to ARCHIVED.
3. optimization_version increments (old variant files become stale).

Pruning is handled by sync_media_registry.py on next run with --clean flag.
Files older than 30 days with no corresponding DB record are safe to delete.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

log = logging.getLogger("apex.media_runtime.cache")


@dataclass
class CachePolicy:
    ttl_seconds: int
    stale_while_revalidate: int
    max_age: int
    immutable: bool = False
    no_cache: bool = False
    tier_name: str = "TIER_MEDIUM"

    def to_dict(self) -> dict:
        return {
            "ttl_seconds":             self.ttl_seconds,
            "stale_while_revalidate":  self.stale_while_revalidate,
            "max_age":                 self.max_age,
            "immutable":               self.immutable,
            "no_cache":                self.no_cache,
            "tier":                    self.tier_name,
        }

    def to_header_value(self) -> str:
        """Build Cache-Control header string."""
        if self.no_cache:
            return "no-cache, no-store, must-revalidate"

        parts = ["public", f"max-age={self.max_age}"]
        if self.stale_while_revalidate:
            parts.append(f"stale-while-revalidate={self.stale_while_revalidate}")
        if self.immutable:
            parts.append("immutable")
        return ", ".join(parts)


# ── Canonical cache tiers ─────────────────────────────────────────────────────

CACHE_TIERS = {
    "TIER_IMMUTABLE": CachePolicy(
        ttl_seconds=31_536_000,  # 1 year
        stale_while_revalidate=0,
        max_age=31_536_000,
        immutable=True,
        tier_name="TIER_IMMUTABLE",
    ),
    "TIER_LONG": CachePolicy(
        ttl_seconds=604_800,     # 7 days
        stale_while_revalidate=86_400,
        max_age=604_800,
        tier_name="TIER_LONG",
    ),
    "TIER_MEDIUM": CachePolicy(
        ttl_seconds=3_600,       # 1 hour
        stale_while_revalidate=300,
        max_age=3_600,
        tier_name="TIER_MEDIUM",
    ),
    "TIER_RACE_WEEKEND": CachePolicy(
        ttl_seconds=1_800,       # 30 min — assets may update during race weekend
        stale_while_revalidate=120,
        max_age=1_800,
        tier_name="TIER_RACE_WEEKEND",
    ),
    "TIER_SHORT": CachePolicy(
        ttl_seconds=300,         # 5 minutes
        stale_while_revalidate=60,
        max_age=300,
        tier_name="TIER_SHORT",
    ),
    "TIER_NO_CACHE": CachePolicy(
        ttl_seconds=0,
        stale_while_revalidate=0,
        max_age=0,
        no_cache=True,
        tier_name="TIER_NO_CACHE",
    ),
    "TIER_API": CachePolicy(
        ttl_seconds=30,
        stale_while_revalidate=30,
        max_age=30,
        tier_name="TIER_API",
    ),
    "TIER_ADAPTIVE_SPIKE": CachePolicy(
        ttl_seconds=60,          # 1 minute during heavy spikes
        stale_while_revalidate=30,
        max_age=60,
        tier_name="TIER_ADAPTIVE_SPIKE",
    ),
    "TIER_BREAKING_NEWS": CachePolicy(
        ttl_seconds=120,         # 2 minutes for breaking news contexts
        stale_while_revalidate=60,
        max_age=120,
        tier_name="TIER_BREAKING_NEWS",
    ),
}

# ── Context → cache tier overrides ───────────────────────────────────────────

# Certain UI contexts warrant more aggressive caching (stable logos)
# or shorter caching (live-session adjacent data)
CONTEXT_CACHE_OVERRIDES = {
    "standings_row":   "TIER_LONG",      # Team logos in standings are very stable
    "driver_dropdown": "TIER_LONG",      # Dropdown headshots rarely change
    "lqip":            "TIER_LONG",      # Blur placeholders are tiny and stable
    "live_session":    "TIER_NO_CACHE",  # Live session never cached
    "breaking_news":   "TIER_BREAKING_NEWS", # Fast-moving news articles
}


def get_cache_policy(
    lifecycle_state: str,
    context: str = "default",
    is_versioned: bool = False,
    is_race_weekend: bool = False,
    load_spike: bool = False,
) -> CachePolicy:
    """
    Determine the correct cache policy for a media asset.

    Decision tree:
    1. Non-production states → no cache
    2. Adaptive load spike → TIER_ADAPTIVE_SPIKE (protect the origin)
    3. Context overrides checked
    4. Race weekend → TIER_RACE_WEEKEND for ACTIVE assets
    5. Versioned ACTIVE asset → TIER_IMMUTABLE
    6. ACTIVE → TIER_LONG
    7. DEGRADED/PENDING → TIER_SHORT
    8. Default → TIER_MEDIUM
    """
    # Non-production states
    if lifecycle_state in ("FAILED", "PROCESSING"):
        return CACHE_TIERS["TIER_NO_CACHE"]

    # Adaptive Governance: protect origin during hot-path spikes
    if load_spike:
        return CACHE_TIERS["TIER_ADAPTIVE_SPIKE"]

    # Context overrides
    if context in CONTEXT_CACHE_OVERRIDES:
        return CACHE_TIERS[CONTEXT_CACHE_OVERRIDES[context]]

    if lifecycle_state == "ACTIVE":
        if is_versioned:
            return CACHE_TIERS["TIER_IMMUTABLE"]
        if is_race_weekend:
            return CACHE_TIERS["TIER_RACE_WEEKEND"]
        return CACHE_TIERS["TIER_LONG"]

    if lifecycle_state in ("DEGRADED", "PENDING_CLEARANCE"):
        return CACHE_TIERS["TIER_SHORT"]

    return CACHE_TIERS["TIER_MEDIUM"]


def get_api_cache_headers(endpoint_type: str = "resolver") -> str:
    """
    Return Cache-Control header string for API endpoints.

    endpoint_type:
      "resolver"    → 5 min SWR (media resolve endpoints)
      "registry"    → 30s SWR (health/status endpoints)
      "static"      → no cache (FAILED/internal state)
    """
    policies = {
        "resolver": f"public, max-age=300, stale-while-revalidate=300",
        "registry": f"public, max-age=30, stale-while-revalidate=30",
        "static":   "no-cache, no-store, must-revalidate",
    }
    return policies.get(endpoint_type, policies["resolver"])
