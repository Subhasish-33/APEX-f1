"""
APEX Delivery Orchestrator — apps/api/media_runtime/delivery_orchestrator.py
==============================================================================
Tier 5 / Phase 2 — Processing & Delivery Engine

PURPOSE
-------
The central runtime coordinator for all media delivery decisions.
Called by the /media API routes to build fully-resolved delivery envelopes.

The orchestrator integrates:
- Variant negotiation (what size/format to serve)
- Preload governance (what to preload vs. lazy-load)
- Cache policy attachment (which cache TTL tier to apply)
- Runtime fallback orchestration (what happens when primary fails)
- Delivery contract assembly (the full envelope the frontend receives)

DELIVERY ENVELOPE CONTRACT
--------------------------
The orchestrator produces a DeliveryEnvelope — the canonical runtime contract
between backend and frontend. The frontend must NEVER need to infer delivery
logic beyond what this envelope provides.

Fields:
  asset_id            — registry ID
  entity_ref          — for debugging/attribution
  category            — asset type
  lifecycle_state     — ACTIVE / DEGRADED / FAILED
  is_production_safe  — final gate (false → use fallback_strategy)
  freshness           — ISO timestamp of last verification
  certification       — CERTIFIED / PROVISIONAL / UNCERTIFIED
  delivery:
    url               — primary delivery URL (cdn or local)
    avif_url          — AVIF alternative when browser supports it
    srcset            — full responsive srcset string
    variant_name      — chosen variant name
    format            — avif | webp
    width             — exact pixel width of chosen variant
    height            — exact pixel height
    preload           — whether <link rel=preload> should be emitted
    cache_policy      — {ttl_seconds, stale_while_revalidate, max_age}
  lqip:
    blurhash          — blurhash string for CSS rendering
    data_uri          — inline base64 WebP for immediate rendering
  fallback:
    strategy          — SILHOUETTE_WIRE / TEAM_COLOR_GLOW / etc.
    team_color        — hex color for CSS fallback rendering
  composition:
    focal_point       — {x, y} for CSS object-position
    aspect_ratio      — float for container reservation
    safe_text_zone    — bottom | left (from composition rules)
  attribution:
    required          — bool
    text              — "Photo by … / CC-BY-SA"
    license_url       — link to license deed
  palette:
    vibrant           — hex
    dark              — hex
    muted             — hex
    light             — hex
  optimization:
    webp_available    — bool
    avif_available    — bool
    blurhash_available— bool
    optimization_version — int (bump = re-fetch)
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from media_runtime.variant_negotiator import negotiate_variant, negotiate_srcset
from media_runtime.preload_governor import PreloadGovernor
from media_runtime.media_cache_manager import CachePolicy, get_cache_policy
from media_runtime.runtime_fallbacks import build_fallback_descriptor

log = logging.getLogger("apex.media_runtime.orchestrator")


def build_delivery_envelope(
    asset: dict,
    request_context: Dict[str, Any],
    governor: Optional[PreloadGovernor] = None,
) -> dict:
    """
    Build the complete DeliveryEnvelope from a resolved media asset dict
    and request context.

    request_context keys:
      viewport_width   — int px
      dpr              — float (1.0 / 2.0 / 3.0)
      accept_header    — HTTP Accept header string
      save_data        — bool (Save-Data: on)
      context          — UI context string (profile_hero / card_grid / etc.)
      route            — current route path
    """
    if not asset or not asset.get("is_production_safe"):
        return _degraded_envelope(asset, request_context)

    viewport_w = request_context.get("viewport_width")
    dpr        = float(request_context.get("dpr", 1.0))
    accept     = request_context.get("accept_header", "image/webp,*/*")
    save_data  = bool(request_context.get("save_data", False))
    context    = request_context.get("context", "default")
    route      = request_context.get("route", "/")

    # Classify viewport
    from media_runtime.variant_negotiator import classify_viewport
    viewport_class = classify_viewport(viewport_w)

    # Negotiate optimal variant
    negotiated = negotiate_variant(
        variants_manifest=asset.get("variants"),
        viewport_class=viewport_class,
        dpr=dpr,
        accept_header=accept,
        save_data=save_data,
        context=context,
    )

    # Build srcset for responsive delivery
    srcset = negotiate_srcset(asset.get("variants"), context=context)

    # Preload decision
    preload_eligible = False
    if negotiated.get("preload", False) and governor:
        preload_eligible = governor.can_preload(route, context, negotiated.get("url"), viewport_class)

    # Cache policy
    cache_policy = get_cache_policy(asset.get("lifecycle_state", "DEGRADED"), context)

    # Freshness / certification
    last_verified = asset.get("last_verified")
    freshness = last_verified.isoformat() + "Z" if isinstance(last_verified, datetime) else str(last_verified or "")
    clearance_status = asset.get("clearance_status", False)
    certification = "CERTIFIED" if clearance_status else "UNCERTIFIED"

    # Dominant palette
    palette = asset.get("dominant_palette") or {}

    # Composition hints
    focal = asset.get("focal_point") or {"x": 0.5, "y": 0.3}
    category = (asset.get("category") or "").replace("MediaCategory.", "")
    safe_text_zone = _safe_text_zone(category)

    return {
        "asset_id":         asset.get("id"),
        "entity_ref":       asset.get("entity_ref"),
        "category":         category,
        "lifecycle_state":  asset.get("lifecycle_state", "UNKNOWN"),
        "is_production_safe": True,
        "freshness":        freshness,
        "certification":    certification,
        "delivery": {
            "url":          negotiated.get("url"),
            "avif_url":     negotiated.get("avif_url"),
            "srcset":       srcset,
            "variant_name": negotiated.get("variant_name"),
            "format":       negotiated.get("format", "webp"),
            "width":        negotiated.get("width"),
            "height":       negotiated.get("height"),
            "preload":      preload_eligible,
            "cache_policy": cache_policy.to_dict(),
        },
        "lqip": {
            "blurhash":  asset.get("blurhash"),
            "data_uri":  _extract_lqip_uri(asset.get("variants")),
        },
        "fallback": build_fallback_descriptor(
            asset.get("fallback_strategy", "APEX_PLACEHOLDER"),
            asset.get("entity_ref"),
            category,
            palette,
        ),
        "composition": {
            "focal_point":     focal,
            "aspect_ratio":    asset.get("aspect_ratio"),
            "has_transparency": asset.get("has_transparency", False),
            "safe_text_zone":  safe_text_zone,
        },
        "attribution": {
            "required":    asset.get("attribution_required", False),
            "text":        asset.get("attribution_text"),
            "license_url": asset.get("license_url"),
        },
        "palette": palette,
        "optimization": {
            "webp_available":     asset.get("webp_available", False),
            "avif_available":     asset.get("avif_available", False),
            "blurhash_available": bool(asset.get("blurhash")),
            "optimization_version": asset.get("optimization_version", 0),
        },
    }


def _degraded_envelope(asset: Optional[dict], request_context: Dict[str, Any]) -> dict:
    """Return a fully-populated but degraded envelope when the asset is not production-safe."""
    category = ""
    entity_ref = ""
    fallback_strategy = "APEX_PLACEHOLDER"

    if asset:
        category = (asset.get("category") or "").replace("MediaCategory.", "")
        entity_ref = asset.get("entity_ref", "")
        fallback_strategy = (asset.get("fallback_strategy") or "APEX_PLACEHOLDER")
        if hasattr(fallback_strategy, "value"):
            fallback_strategy = fallback_strategy.value

    return {
        "asset_id":         asset.get("id") if asset else None,
        "entity_ref":       entity_ref,
        "category":         category,
        "lifecycle_state":  "DEGRADED",
        "is_production_safe": False,
        "freshness":        None,
        "certification":    "UNCERTIFIED",
        "delivery": {
            "url":          None,
            "avif_url":     None,
            "srcset":       "",
            "variant_name": "fallback",
            "format":       "webp",
            "width":        None,
            "height":       None,
            "preload":      False,
            "cache_policy": CachePolicy(ttl_seconds=300, stale_while_revalidate=60, max_age=60).to_dict(),
        },
        "lqip":     {"blurhash": None, "data_uri": None},
        "fallback": build_fallback_descriptor(fallback_strategy, entity_ref, category, {}),
        "composition": {"focal_point": {"x": 0.5, "y": 0.5}, "aspect_ratio": None,
                        "has_transparency": False, "safe_text_zone": "bottom"},
        "attribution": {"required": False, "text": None, "license_url": None},
        "palette":  {},
        "optimization": {"webp_available": False, "avif_available": False,
                         "blurhash_available": False, "optimization_version": 0},
    }


def _safe_text_zone(category: str) -> str:
    """Return the safe text zone for a given category (from MEDIA_COMPOSITION_RULES.md)."""
    zones = {
        "HEADSHOT": "bottom",
        "HERO": "left",
        "CAR_RENDER": "top",
        "LOGO": "none",
        "MAP": "none",
        "THUMBNAIL": "bottom",
        "CINEMATIC": "left",
        "ARTICLE_HERO": "left",
    }
    return zones.get(category.upper(), "bottom")


def _extract_lqip_uri(variants: Optional[dict]) -> Optional[str]:
    """Extract an inline data URI from the blur variant if available."""
    if not variants:
        return None
    blur = variants.get("blur", {})
    return blur.get("data_uri") or blur.get("lqip_data_uri")
