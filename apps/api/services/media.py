"""
APEX Media Service — apps/api/services/media.py
===============================================
Tier 5 / Phase 2 — Processing & Delivery Engine

PHASE 2 UPGRADES
----------------
- resolve_asset() now returns a full DeliveryEnvelope via the orchestrator
- Budget violation flag checked: assets with budget_error in variants are not served
- Blurhash and LQIP data_uri exposed in response
- Cache-Control headers attached to all responses
- Request context (viewport, DPR, accept, save-data) used for variant negotiation
- Runtime fallback chain included in response
- Observability fields: freshness, certification, optimization_hints

DELIVERY CONTRACT (DeliveryEnvelope)
-------------------------------------
The frontend receives a single deterministic envelope.
It NEVER needs to infer delivery logic beyond what this provides.
See media_runtime/delivery_orchestrator.py for full field documentation.

CRITICAL INVARIANTS (unchanged from Phase 1)
--------------------------------------------
- is_production_safe=False → degraded envelope returned
- source_url never exposed in production responses
- All DB exceptions caught → static fallback returned
- Never returns None — always a valid response dict
"""

from __future__ import annotations

import logging
from typing import Optional, Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models import MediaAsset, MediaLifecycleState

log = logging.getLogger("apex.services.media")


class MediaResolutionResult:
    """
    The resolved media record returned to the frontend.
    This is the ONLY object the API route should return for media.
    """
    __slots__ = (
        "id", "entity_type", "entity_ref", "category", "season",
        "cdn_url", "variants", "dominant_palette", "focal_point",
        "width", "height", "aspect_ratio", "blurhash", "has_transparency",
        "webp_available", "avif_available",
        "lifecycle_state", "fallback_strategy",
        "attribution_required", "attribution_text", "license_url",
        "is_production_safe",
    )

    def __init__(self, asset: MediaAsset):
        self.id              = asset.id
        self.entity_type     = asset.entity_type.value if asset.entity_type else None
        self.entity_ref      = asset.entity_ref
        self.category        = asset.category.value if asset.category else None
        self.season          = asset.season

        # Serve cdn_url in production — never source_url
        self.cdn_url         = asset.cdn_url or asset.internal_url
        self.variants        = asset.variants or {}
        self.dominant_palette = asset.dominant_palette or {}
        self.focal_point     = asset.focal_point or {"x": 0.5, "y": 0.3}

        # CLS prevention metadata
        self.width           = asset.width
        self.height          = asset.height
        self.aspect_ratio    = asset.aspect_ratio
        self.blurhash        = asset.blurhash
        self.has_transparency = asset.has_transparency

        # Optimization flags
        self.webp_available  = asset.webp_available
        self.avif_available  = asset.avif_available

        # State — frontend uses this to choose render strategy
        self.lifecycle_state  = asset.lifecycle_state.value if asset.lifecycle_state else "UNKNOWN"
        self.fallback_strategy = (
            asset.fallback_strategy.value if asset.fallback_strategy else "APEX_PLACEHOLDER"
        )

        # Attribution — rendered in UI when attribution_required=True
        self.attribution_required = asset.attribution_required
        self.attribution_text     = asset.attribution_text
        self.license_url          = asset.license_url

        self.is_production_safe  = asset.is_production_safe

    def to_dict(self) -> dict:
        return {s: getattr(self, s) for s in self.__slots__}


def _static_fallback(entity_type: str, entity_ref: str, category: str) -> dict:
    """
    Returns a static fallback descriptor when no DB record exists.
    This ensures the API never returns None — always a deterministic response.
    """
    # Determine fallback strategy by category
    strategy_map = {
        "HEADSHOT":    "SILHOUETTE_WIRE",
        "HERO":        "SILHOUETTE_WIRE",
        "LOGO":        "TEAM_COLOR_GLOW",
        "CAR_RENDER":  "COLOR_BLOCK",
        "HELMET":      "SILHOUETTE_WIRE",
        "MAP":         "GENERIC_TRACK",
        "FLAG":        "COLOR_BLOCK",
        "THUMBNAIL":   "APEX_PLACEHOLDER",
        "ARTICLE_HERO":"APEX_PLACEHOLDER",
    }

    return {
        "id": None,
        "entity_type": entity_type,
        "entity_ref": entity_ref,
        "category": category,
        "season": None,
        "cdn_url": None,
        "variants": {},
        "dominant_palette": {},
        "focal_point": {"x": 0.5, "y": 0.5},
        "width": None,
        "height": None,
        "aspect_ratio": None,
        "blurhash": None,
        "has_transparency": None,
        "webp_available": False,
        "avif_available": False,
        "lifecycle_state": "DEGRADED",
        "fallback_strategy": strategy_map.get(category, "APEX_PLACEHOLDER"),
        "attribution_required": False,
        "attribution_text": None,
        "license_url": None,
        "is_production_safe": False,
    }


async def resolve_asset(
    session: AsyncSession,
    entity_type: str,
    entity_ref: str,
    category: str,
    season: Optional[int] = None,
) -> dict:
    """
    Primary resolution path.

    Resolution order:
    1. ACTIVE, is_production_safe=True, season-matched
    2. ACTIVE, is_production_safe=True, evergreen (season=NULL)
    3. PENDING_CLEARANCE (best-effort, marked as not production_safe)
    4. Static fallback descriptor

    Returns a dict always — never raises.
    """
    try:
        # Build base filter
        base_filter = and_(
            MediaAsset.entity_type == entity_type,
            MediaAsset.entity_ref == entity_ref,
            MediaAsset.category == category,
        )

        # Attempt 1: ACTIVE + season-matched
        if season:
            stmt = (
                select(MediaAsset)
                .where(and_(base_filter, MediaAsset.season == season,
                            MediaAsset.lifecycle_state == MediaLifecycleState.ACTIVE,
                            MediaAsset.is_production_safe.is_(True)))
                .order_by(MediaAsset.priority)
                .limit(1)
            )
            result = await session.execute(stmt)
            asset = result.scalar_one_or_none()
            if asset:
                return MediaResolutionResult(asset).to_dict()

        # Attempt 2: ACTIVE + evergreen
        stmt = (
            select(MediaAsset)
            .where(and_(base_filter,
                        MediaAsset.lifecycle_state == MediaLifecycleState.ACTIVE,
                        MediaAsset.is_production_safe.is_(True)))
            .order_by(MediaAsset.priority)
            .limit(1)
        )
        result = await session.execute(stmt)
        asset = result.scalar_one_or_none()
        if asset:
            return MediaResolutionResult(asset).to_dict()

        # Attempt 3: PENDING_CLEARANCE (degraded serving)
        stmt = (
            select(MediaAsset)
            .where(and_(base_filter,
                        MediaAsset.lifecycle_state == MediaLifecycleState.PENDING_CLEARANCE))
            .order_by(MediaAsset.priority)
            .limit(1)
        )
        result = await session.execute(stmt)
        asset = result.scalar_one_or_none()
        if asset:
            resolved = MediaResolutionResult(asset).to_dict()
            resolved["lifecycle_state"] = "DEGRADED"
            resolved["is_production_safe"] = False
            return resolved

    except Exception as e:
        log.error(f"Media resolution error for {entity_type}/{entity_ref}/{category}: {e}")

    # Attempt 4: Static fallback
    log.debug(f"No asset found for {entity_type}/{entity_ref}/{category} — returning static fallback")
    return _static_fallback(entity_type, entity_ref, category)


async def resolve_entity_media(
    session: AsyncSession,
    entity_type: str,
    entity_ref: str,
    season: Optional[int] = None,
    request_context: Optional[dict] = None,
) -> dict[str, dict]:
    """
    Resolve ALL categories for a given entity in one query.
    Returns a dict keyed by category name.
    Used by driver/team profile pages to get all assets in one call.
    """
    try:
        stmt = (
            select(MediaAsset)
            .where(and_(
                MediaAsset.entity_type == entity_type,
                MediaAsset.entity_ref == entity_ref,
                MediaAsset.is_production_safe.is_(True),
            ))
            .order_by(MediaAsset.category, MediaAsset.priority)
        )
        result = await session.execute(stmt)
        assets = result.scalars().all()

        resolved: dict[str, dict] = {}
        seen_categories = set()

        ctx = request_context or {}
        
        # Instantiate governor per request for all assets in this entity
        governor = None
        try:
            from media_runtime.preload_governor import PreloadGovernor
            governor = PreloadGovernor()
        except ImportError:
            pass

        for asset in assets:
            cat = asset.category.value if asset.category else "UNKNOWN"
            if cat not in seen_categories:
                # Build dictionary like resolve_asset does
                from services.media import MediaResolutionResult
                asset_dict = MediaResolutionResult(asset).to_dict()
                
                # Check for budget violations
                if has_budget_violations(asset_dict.get("variants")):
                    log.warning(f"[{entity_ref}/{cat}] Budget violations found — serving degraded fallback")
                    asset_dict["is_production_safe"] = False
                    asset_dict["lifecycle_state"]    = "DEGRADED"
                
                try:
                    from media_runtime.delivery_orchestrator import build_delivery_envelope
                    from media_runtime.runtime_fallbacks import build_runtime_fallback_chain
                    
                    envelope = build_delivery_envelope(asset_dict, ctx, governor=governor)
                    envelope["runtime_fallback_chain"] = build_runtime_fallback_chain(asset_dict.get("variants"))
                    resolved[cat] = envelope
                except Exception as e:
                    log.error(f"Orchestrator error for {entity_type}/{entity_ref}/{cat}: {e}")
                    resolved[cat] = asset_dict
                    
                seen_categories.add(cat)

        return resolved

    except Exception as e:
        log.error(f"resolve_entity_media error for {entity_type}/{entity_ref}: {e}")
        return {}


# ── Phase 2: Delivery Envelope Resolution ────────────────────────────────────

def has_budget_violations(variants: Optional[dict]) -> bool:
    """
    Returns True if any variant in the manifest has budget_ok=False.
    Budget-violated assets MUST NOT be cleared for production.
    This is checked by audit_media.py and the media service.
    """
    if not variants:
        return False
    return any(
        not v.get("budget_ok", True)
        for v in variants.values()
    )


async def resolve_with_context(
    session: AsyncSession,
    entity_type: str,
    entity_ref: str,
    category: str,
    season: Optional[int] = None,
    request_context: Optional[dict] = None,
    governor: Optional[Any] = None,
) -> dict:
    """
    Phase 2 resolution path — returns a full DeliveryEnvelope.

    request_context:
      viewport_width   int
      dpr              float
      accept_header    str (HTTP Accept)
      save_data        bool
      context          str (UI context: profile_hero, card_grid, etc.)
      route            str (/drivers/hamilton)
      
    governor: PreloadGovernor instance for request-scoped preload management.

    Falls back to resolve_asset() envelope format if orchestrator unavailable.
    """
    # First: get the raw asset record using Phase 1 resolution chain
    asset_dict = await resolve_asset(session, entity_type, entity_ref, category, season)

    # Check for budget violations before serving
    if has_budget_violations(asset_dict.get("variants")):
        log.warning(
            f"[{entity_ref}/{category}] Budget violations found — serving degraded fallback"
        )
        asset_dict["is_production_safe"] = False
        asset_dict["lifecycle_state"]    = "DEGRADED"

    # Try Phase 2 orchestrator for rich envelope
    try:
        from media_runtime.delivery_orchestrator import build_delivery_envelope
        from media_runtime.runtime_fallbacks import build_runtime_fallback_chain

        ctx = request_context or {}
        envelope = build_delivery_envelope(asset_dict, ctx, governor=governor)

        # Attach runtime fallback chain for client-side use
        envelope["runtime_fallback_chain"] = build_runtime_fallback_chain(
            asset_dict.get("variants")
        )
        return envelope

    except ImportError:
        # media_runtime not available — return Phase 1 format (backward compat)
        log.debug("media_runtime not available — returning Phase 1 format")
        return asset_dict
    except Exception as e:
        log.error(f"Orchestrator error for {entity_type}/{entity_ref}/{category}: {e}")
        return asset_dict

