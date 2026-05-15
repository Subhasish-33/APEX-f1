from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, desc
from typing import Annotated, List, Dict, Any
import time
from datetime import datetime

from dependencies import get_db
from cache.manager import redis_client
from models import PlatformHealth
from schemas import PlatformHealthResponse

router = APIRouter(prefix="/health")
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/live")
async def liveness_probe():
    """
    Minimal liveness probe for Railway/Docker.
    Must return instantly and not touch any dependencies.
    """
    return {"status": "alive", "timestamp": time.time()}

@router.get("/ready")
async def readiness_probe(session: DBSession):
    """
    Readiness verification.
    Checks PostgreSQL and Redis availability.
    Returns 503 if critical dependencies are down.
    """
    health_status = {
        "status": "ready",
        "database": "unhealthy",
        "redis": "unhealthy",
        "timestamp": datetime.utcnow()
    }
    
    is_ready = True
    
    # 1. Check Database
    try:
        await session.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception:
        health_status["database"] = "unhealthy"
        is_ready = False
        
    # 2. Check Redis
    try:
        await redis_client.ping()
        health_status["redis"] = "healthy"
    except Exception:
        health_status["redis"] = "unhealthy"
        is_ready = False
        
    if not is_ready:
        health_status["status"] = "not_ready"
        return Response(
            content=str(health_status), 
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            media_type="application/json"
        )
        
    return health_status

@router.get("/system")
async def system_diagnostics(session: DBSession):
    """
    Operational diagnostics for observability.
    Includes versioning, degradation states, and recent health events.
    """
    # Recent health events
    stmt = select(PlatformHealth).order_by(desc(PlatformHealth.timestamp)).limit(5)
    result = await session.execute(stmt)
    recent_events = result.scalars().all()
    
    # Check for critical degradation in last events
    is_degraded = any(e.status == "CRITICAL" for e in recent_events)
    
    # Redis latency/freshness (simplified)
    redis_alive = False
    try:
        await redis_client.ping()
        redis_alive = True
    except Exception:
        pass

    return {
        "status": "DEGRADED" if is_degraded else "OPERATIONAL",
        "version": "3.5.0-hardened",
        "uptime_ref": time.time(),
        "redis_connected": redis_alive,
        "recent_alerts": [
            {"type": e.event_type, "message": e.message, "status": e.status}
            for e in recent_events
        ],
        "governance": {
            "tier_4_caching": "ENABLED",
            "fail_soft": "ACTIVE",
            "telemetry_threshold": "15s"
        }
    }

# Retain legacy route for compatibility with previous UI assumptions
@router.get("/platform", response_model=List[PlatformHealthResponse])
async def get_platform_health_legacy(session: DBSession, limit: int = 10):
    stmt = select(PlatformHealth).order_by(desc(PlatformHealth.timestamp)).limit(limit)
    result = await session.execute(stmt)
    return result.scalars().all()
