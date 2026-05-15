"""
APEX Media API Route — apps/api/routes/media.py
===============================================
Tier 5 / Phase 1 — Frontend Media Resolution Endpoint

ENDPOINTS
---------
GET /media/{entity_type}/{entity_ref}/{category}
    Resolve a single asset slot.
    Query params: ?season=2025

GET /media/{entity_type}/{entity_ref}
    Resolve all category slots for an entity (driver/team profile pages).
    Query params: ?season=2025

GET /media/registry/status
    Current registry health: lifecycle counts, coverage %, clearance counts.

RESPONSE CONTRACT
-----------------
All responses include:
  - cdn_url           (serve this — never source_url)
  - variants          (all size variants with cdn_url)
  - dominant_palette  (for zero-latency theming)
  - lifecycle_state   (ACTIVE/DEGRADED — tells UI which fallback to use)
  - fallback_strategy (CSS strategy if cdn_url is null)
  - is_production_safe (final safety gate)

The frontend MUST check is_production_safe before rendering cdn_url.
If False, the frontend MUST render the fallback_strategy instead.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from dependencies import get_db
from models import MediaAsset, MediaLifecycleState
from services.media import resolve_asset, resolve_entity_media, resolve_with_context

router = APIRouter(prefix="/media")

@router.get("/registry/status")
async def media_registry_status(session: AsyncSession = Depends(get_db)):
    """
    Operational health of the media registry.
    Returns lifecycle distribution, coverage stats, and clearance counts.
    """
    try:
        # Lifecycle distribution
        dist_result = await session.execute(
            text("SELECT lifecycle_state, COUNT(*) as count FROM media_assets GROUP BY lifecycle_state")
        )
        distribution = {row[0]: row[1] for row in dist_result.fetchall()}

        # Clearance counts
        cleared = await session.execute(
            text("SELECT COUNT(*) FROM media_assets WHERE clearance_status = true")
        )
        production_safe = await session.execute(
            text("SELECT COUNT(*) FROM media_assets WHERE is_production_safe = true")
        )
        total = await session.execute(text("SELECT COUNT(*) FROM media_assets"))

        total_count     = total.scalar() or 0
        cleared_count   = cleared.scalar() or 0
        safe_count      = production_safe.scalar() or 0
        active_count    = distribution.get("ACTIVE", 0)

        return {
            "status": "OPERATIONAL" if active_count > 0 else "DEGRADED",
            "total_assets": total_count,
            "lifecycle_distribution": distribution,
            "clearance": {
                "cleared": cleared_count,
                "production_safe": safe_count,
                "pending": total_count - cleared_count,
            },
            "coverage_pct": round((active_count / total_count * 100) if total_count else 0, 1),
        }
    except Exception as e:
        return {
            "status": "DEGRADED",
            "error": str(e),
            "total_assets": 0,
        }

def _build_request_context(
    request: Request,
    viewport_width: Optional[int],
    dpr: Optional[float],
    context: Optional[str],
) -> dict:
    return {
        "viewport_width": viewport_width,
        "dpr": dpr or 1.0,
        "accept_header": request.headers.get("accept", "image/webp,*/*"),
        "save_data": request.headers.get("save-data", "") == "on",
        "context": context or "default",
        "route": request.headers.get("referer", "/"),
    }

@router.get("/{entity_type}/{entity_ref}/{category}")
async def resolve_single_asset(
    request: Request,
    entity_type: str,
    entity_ref: str,
    category: str,
    season: Optional[int] = Query(default=None),
    viewport_width: Optional[int] = Query(default=None),
    dpr: Optional[float] = Query(default=None),
    context: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_db),
):
    """
    Resolve a single media slot.
    Always returns a response — degraded fallback if no ACTIVE asset found.
    """
    req_ctx = _build_request_context(request, viewport_width, dpr, context)
    
    governor = None
    try:
        from media_runtime.preload_governor import PreloadGovernor
        governor = PreloadGovernor()
    except ImportError:
        pass

    result = await resolve_with_context(
        session,
        entity_type=entity_type.upper(),
        entity_ref=entity_ref.lower(),
        category=category.upper(),
        season=season,
        request_context=req_ctx,
        governor=governor,
    )
    return {"data": result}


@router.get("/{entity_type}/{entity_ref}")
async def resolve_entity_all_media(
    request: Request,
    entity_type: str,
    entity_ref: str,
    season: Optional[int] = Query(default=None),
    viewport_width: Optional[int] = Query(default=None),
    dpr: Optional[float] = Query(default=None),
    context: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_db),
):
    """
    Resolve all media slots for a driver/team/circuit in one request.
    Optimized for profile pages that need all assets simultaneously.
    """
    req_ctx = _build_request_context(request, viewport_width, dpr, context)
    
    result = await resolve_entity_media(
        session,
        entity_type=entity_type.upper(),
        entity_ref=entity_ref.lower(),
        season=season,
        request_context=req_ctx,
    )
    return {"data": result, "entity_type": entity_type.upper(), "entity_ref": entity_ref.lower()}

from pydantic import BaseModel

class MediaObservationEvent(BaseModel):
    event: str
    entity_ref: Optional[str] = None
    category: Optional[str] = None
    failed_url: Optional[str] = None
    fallback_to: Optional[str] = None
    message: Optional[str] = None
    timestamp: Optional[str] = None

@router.post("/observe")
async def observe_media_event(event: MediaObservationEvent, request: Request):
    """
    Collect runtime observability events (e.g., fallbacks, incidents) from EliteImage V2.
    """
    import logging
    obs_log = logging.getLogger("apex.media.observability")
    
    # In a real system, this might push to a queue, Prometheus, or structured log drain
    obs_log.warning(
        f"Media Observability Event: {event.event} | Ref: {event.entity_ref}/{event.category} | "
        f"Failed: {event.failed_url} -> Fallback: {event.fallback_to} | Msg: {event.message} | "
        f"UA: {request.headers.get('user-agent')}"
    )
    
    return {"status": "logged"}
