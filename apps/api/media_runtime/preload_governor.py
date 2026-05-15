"""
APEX Preload Governor — apps/api/media_runtime/preload_governor.py
==================================================================
Tier 5 / Phase 2 — Delivery Intelligence

PURPOSE
-------
Controls which assets receive <link rel="preload"> hints.

Preloading too many assets is worse than preloading none —
it steals bandwidth from the LCP asset and causes preload entropy.

The governor enforces:
1. Per-route preload budget (max N preloads per page)
2. Context eligibility (only above-fold, LCP-critical contexts)
3. Duplicate prevention (same URL never preloaded twice per request)
4. Mobile suppression (preloads are disabled on mobile by default)
5. Race-weekend override (more aggressive preloading on race weekends)

PRELOAD BUDGET (from MEDIA_PERFORMANCE_POLICY.md)
-------------------------------------------------
  Homepage:       max 1 preload (cinematic hero)
  Driver profile: max 1 preload (hero)
  Team profile:   max 1 preload (hero)
  Race hub:       max 1 preload (next race thumbnail)
  News page:      max 1 preload (article hero)
  All others:     max 0 preloads

MOBILE POLICY
-------------
No preloads on mobile by default.
Mobile devices on constrained networks should never receive preload hints
for large images — they cause LCP regression.
Exception: mobile hero on race day (controlled by race_weekend flag).
"""

from __future__ import annotations

import logging
from typing import Dict, Set

log = logging.getLogger("apex.media_runtime.preload_governor")

# ── Route → max preload budget ────────────────────────────────────────────────

ROUTE_PRELOAD_BUDGET: Dict[str, int] = {
    "/":                    1,  # Homepage — cinematic hero only
    "/drivers":             0,  # Driver list — lazy load all cards
    "/drivers/[ref]":       1,  # Driver profile — hero only
    "/teams":               0,  # Team list — lazy load
    "/teams/[ref]":         1,  # Team profile — hero only
    "/races":               0,  # Calendar — lazy load thumbnails
    "/races/[ref]":         1,  # Race hub — thumbnail/hero
    "/standings":           0,  # Data-only page — no image preloads
    "/news":                0,  # News list — lazy load
    "/news/[slug]":         1,  # Article — article hero
    "/live":                0,  # Live timing — zero image preloads
}

DEFAULT_BUDGET = 0

# ── Context eligibility ───────────────────────────────────────────────────────

PRELOAD_ELIGIBLE_CONTEXTS: Set[str] = {
    "profile_hero",
    "full_bleed",
    "news_hero",
    "team_header",
}

# ── Governor ──────────────────────────────────────────────────────────────────

class PreloadGovernor:
    """
    Stateful per-request preload governor.
    Create one instance per request cycle — do not share across requests.
    """

    def __init__(self, mobile: bool = False, race_weekend: bool = False):
        self._mobile        = mobile
        self._race_weekend  = race_weekend
        self._preloaded_urls: Set[str] = set()
        self._route_counts:  Dict[str, int] = {}

    def can_preload(
        self,
        route: str,
        context: str,
        url: str = "",
        viewport_class: str = "desktop",
    ) -> bool:
        """
        Returns True if this asset should receive a preload hint.

        Rules evaluated in order:
        1. Mobile suppression (unless race_weekend override)
        2. Context eligibility
        3. Route budget
        4. Duplicate prevention
        """
        # Rule 1: Mobile suppression
        if viewport_class == "mobile" and not self._race_weekend:
            log.debug(f"Preload denied: mobile suppression for {url}")
            return False

        # Rule 2: Context eligibility
        if context not in PRELOAD_ELIGIBLE_CONTEXTS:
            return False

        # Rule 3: Route budget
        normalized_route = self._normalize_route(route)
        budget = ROUTE_PRELOAD_BUDGET.get(normalized_route, DEFAULT_BUDGET)
        used   = self._route_counts.get(normalized_route, 0)

        if used >= budget:
            log.debug(f"Preload denied: route {normalized_route} budget exhausted ({used}/{budget})")
            return False

        # Rule 4: Duplicate prevention
        if url and url in self._preloaded_urls:
            log.debug(f"Preload denied: duplicate URL {url}")
            return False

        # Grant preload
        self._route_counts[normalized_route] = used + 1
        if url:
            self._preloaded_urls.add(url)
        return True

    def reset(self) -> None:
        """Reset state for a new request cycle."""
        self._preloaded_urls.clear()
        self._route_counts.clear()

    @staticmethod
    def _normalize_route(route: str) -> str:
        """
        Normalize dynamic route segments for budget lookup.
        /drivers/hamilton → /drivers/[ref]
        /races/bahrain-2025 → /races/[ref]
        """
        parts = route.strip("/").split("/")
        if len(parts) == 0:
            return "/"

        normalized_parts = []
        for i, part in enumerate(parts):
            if i == 0:
                normalized_parts.append(part)
            else:
                # Assume any second segment after a known collection is dynamic
                normalized_parts.append("[ref]")

        return "/" + "/".join(normalized_parts)


def build_preload_hints(envelopes: list[dict]) -> list[dict]:
    """
    Given a list of DeliveryEnvelopes, extract only those that
    have preload=True and return structured preload hint objects.

    Each hint:
    {
        "url":       "…",           # primary URL (WebP)
        "avif_url":  "…" or None,
        "as":        "image",
        "type":      "image/avif" | "image/webp",
        "fetchpriority": "high",
        "imagesrcset": "…",         # srcset for responsive preload
    }
    """
    hints = []
    for env in envelopes:
        delivery = env.get("delivery", {})
        if not delivery.get("preload"):
            continue

        avif_url = delivery.get("avif_url")
        url      = delivery.get("url")
        srcset   = delivery.get("srcset", "")

        if not url:
            continue

        hints.append({
            "url":           avif_url or url,
            "fallback_url":  url,
            "as":            "image",
            "type":          "image/avif" if avif_url else "image/webp",
            "fetchpriority": "high",
            "imagesrcset":   srcset,
        })

    return hints
