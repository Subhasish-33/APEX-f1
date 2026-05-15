"""
APEX Variant Negotiator — apps/api/media_runtime/variant_negotiator.py
=======================================================================
Tier 5 / Phase 2 — Delivery Intelligence

PURPOSE
-------
Selects the optimal variant for a given request context.
This is the core intelligence layer — called by the delivery orchestrator
to decide WHAT to serve BEFORE touching storage or CDN.

NEGOTIATION DIMENSIONS
----------------------
1. Format preference: AVIF → WebP (by browser Accept header)
2. Viewport class: mobile → card | desktop → hero | fullbleed → cinematic
3. DPR (Device Pixel Ratio): 1x → standard | 2x → retina | mobile + 2x → hero
4. Route context: determines preload eligibility and priority
5. Network hint: save-data / ECT degrades to smaller variants

VARIANT SELECTION MATRIX
-------------------------
  Context             → Primary Variant → Fallback Variant
  -----------------------------------------------------------
  mobile viewport     → mobile          → card
  mobile + 2x DPR     → hero            → card
  tablet viewport     → card            → thumbnail
  desktop grid        → card            → thumbnail
  profile hero        → hero            → card
  full-bleed hero     → cinematic       → hero
  retina desktop hero → retina          → hero
  thumbnail grid      → thumbnail       → blur
  LQIP/placeholder    → blur            → (inline data URI)

USAGE
-----
  from media_runtime.variant_negotiator import negotiate_variant
  variant = negotiate_variant(
      variants_manifest=asset["variants"],
      viewport_class="mobile",
      dpr=2,
      accept_header="image/avif,image/webp,*/*",
      save_data=False,
      context="profile_hero",
  )
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

log = logging.getLogger("apex.media_runtime.negotiator")

# ── Viewport classification ────────────────────────────────────────────────────

def classify_viewport(width_px: Optional[int]) -> str:
    """Classify a viewport width into a named class."""
    if width_px is None:
        return "desktop"
    if width_px < 480:
        return "mobile"
    if width_px < 1024:
        return "tablet"
    return "desktop"


# ── Format preference ─────────────────────────────────────────────────────────

def preferred_format(accept_header: Optional[str]) -> str:
    """Determine preferred image format from HTTP Accept header."""
    if not accept_header:
        return "webp"
    if "image/avif" in accept_header:
        return "avif"
    if "image/webp" in accept_header:
        return "webp"
    return "jpeg"


# ── Context → variant priority list ───────────────────────────────────────────

CONTEXT_VARIANT_PRIORITY: Dict[str, list[str]] = {
    "profile_hero":   ["hero", "cinematic", "card", "thumbnail"],
    "card_grid":      ["card", "thumbnail", "hero"],
    "thumbnail_grid": ["thumbnail", "card"],
    "full_bleed":     ["cinematic", "hero", "card"],
    "standings_row":  ["thumbnail", "card"],
    "team_header":    ["hero", "cinematic", "card"],
    "team_card":      ["card", "hero", "thumbnail"],
    "driver_dropdown":["thumbnail", "card"],
    "news_hero":      ["cinematic", "hero", "card"],
    "news_card":      ["card", "thumbnail"],
    "lqip":           ["blur"],
    "default":        ["card", "hero", "thumbnail", "cinematic"],
}

MOBILE_OVERRIDES: Dict[str, list[str]] = {
    "profile_hero":   ["hero", "mobile", "card"],
    "full_bleed":     ["mobile", "hero", "card"],
    "card_grid":      ["mobile", "card", "thumbnail"],
    "team_header":    ["mobile", "card", "hero"],
    "news_hero":      ["mobile", "hero", "card"],
    "default":        ["mobile", "card", "thumbnail"],
}


def _pick_variant(variants: Dict[str, Any], priority_list: list[str]) -> Optional[str]:
    """Return the first variant name in priority_list that exists in the manifest."""
    for name in priority_list:
        if name in variants and variants[name].get("budget_ok", True):
            return name
    # Fallback: any available variant that passed budget
    for name, meta in variants.items():
        if meta.get("budget_ok", True) and name != "blur":
            return name
    return None


def negotiate_variant(
    variants_manifest: Optional[Dict[str, Any]],
    viewport_class: str = "desktop",
    dpr: float = 1.0,
    accept_header: Optional[str] = None,
    save_data: bool = False,
    context: str = "default",
) -> Dict[str, Any]:
    """
    Core negotiation function.

    Returns a delivery descriptor:
    {
        "variant_name":  "hero",
        "url":           "…",          # cdn_url for the chosen variant
        "avif_url":      "…",          # if AVIF available and preferred
        "width":         1200,
        "height":        800,
        "format":        "avif" | "webp",
        "is_lqip":       False,
        "preload":       True,         # whether this should be preloaded
    }
    """
    if not variants_manifest:
        return {
            "variant_name":  "fallback",
            "url":           None,
            "avif_url":      None,
            "width":         None,
            "height":        None,
            "format":        "webp",
            "is_lqip":       False,
            "preload":       False,
        }

    # Resolve priority list based on viewport + context
    if viewport_class == "mobile" and context in MOBILE_OVERRIDES:
        priority_list = MOBILE_OVERRIDES[context]
    elif context in CONTEXT_VARIANT_PRIORITY:
        priority_list = CONTEXT_VARIANT_PRIORITY[context]
    else:
        priority_list = CONTEXT_VARIANT_PRIORITY["default"]

    # DPR upgrade: mobile 2× gets hero instead of mobile variant
    if dpr >= 2.0 and viewport_class == "mobile" and "mobile" in priority_list:
        priority_list = ["hero", "card", "mobile", "thumbnail"]

    # Save-data downgrade: aggressively reduce variant size
    if save_data:
        priority_list = ["thumbnail", "card", "mobile"]
        log.debug("Save-Data header detected — downgrading to thumbnail priority")

    chosen = _pick_variant(variants_manifest, priority_list)
    if not chosen:
        log.warning("No suitable variant found in manifest")
        return {
            "variant_name":  "fallback",
            "url":           None,
            "avif_url":      None,
            "width":         None,
            "height":        None,
            "format":        "webp",
            "is_lqip":       False,
            "preload":       False,
        }

    meta = variants_manifest[chosen]
    fmt  = preferred_format(accept_header)

    # AVIF URL resolution
    avif_url: Optional[str] = None
    if fmt == "avif" and meta.get("avif"):
        avif_url = meta.get("avif_cdn_url") or meta.get("avif_url")

    # Primary URL resolution — prefer CDN, fall back to local
    primary_url = (
        meta.get("cdn_url")
        or meta.get("url")
    )

    # Preload eligibility: only for above-fold, non-save-data contexts
    preload_contexts = {"profile_hero", "full_bleed", "news_hero", "team_header"}
    should_preload = context in preload_contexts and not save_data and viewport_class != "mobile"

    return {
        "variant_name": chosen,
        "url":          primary_url,
        "avif_url":     avif_url,
        "width":        meta.get("width"),
        "height":       meta.get("height"),
        "format":       fmt if (fmt == "avif" and avif_url) else "webp",
        "is_lqip":      chosen == "blur",
        "preload":      should_preload,
    }


def negotiate_srcset(
    variants_manifest: Optional[Dict[str, Any]],
    context: str = "card_grid",
) -> str:
    """
    Build an HTML srcset string for responsive delivery.
    Returns an empty string if no variants available.
    """
    if not variants_manifest:
        return ""

    srcset_parts = []
    for vname in ["thumbnail", "card", "mobile", "hero", "retina", "cinematic"]:
        meta = variants_manifest.get(vname)
        if meta and meta.get("budget_ok", True):
            url = meta.get("cdn_url") or meta.get("url")
            w   = meta.get("width")
            if url and w:
                srcset_parts.append(f"{url} {w}w")

    return ", ".join(srcset_parts)
