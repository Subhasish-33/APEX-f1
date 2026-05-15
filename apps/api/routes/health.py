from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, desc
from typing import Annotated, List
import time
import asyncio
from datetime import datetime

from dependencies import get_db
from cache.manager import redis_client
from models import PlatformHealth
from schemas import PlatformHealthResponse

router = APIRouter(prefix="/health")
DBSession = Annotated[AsyncSession, Depends(get_db)]
HEALTHCHECK_TIMEOUT_SECONDS = 2.0


def _utc_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"


async def _measure_dependency(name: str, check):
    start = time.perf_counter()
    try:
        await asyncio.wait_for(check(), timeout=HEALTHCHECK_TIMEOUT_SECONDS)
        return {
            "name": name,
            "status": "healthy",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": None,
        }
    except asyncio.TimeoutError:
        return {
            "name": name,
            "status": "unhealthy",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": "timeout",
        }
    except Exception as exc:
        return {
            "name": name,
            "status": "unhealthy",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": exc.__class__.__name__,
        }

@router.get("/live")
async def liveness_probe():
    """
    Minimal liveness probe for Railway/Docker.
    Must return instantly and not touch any dependencies.
    """
    return {
        "status": "alive",
        "service": "apex-f1-api",
        "timestamp": _utc_timestamp(),
    }

@router.get("/ready")
async def readiness_probe(session: DBSession):
    """
    Readiness verification.
    Checks PostgreSQL and Redis availability.
    Returns 503 if critical dependencies are down.
    """
    async def check_database():
        await session.execute(text("SELECT 1"))

    async def check_redis():
        await redis_client.ping()

    database, redis = await asyncio.gather(
        _measure_dependency("database", check_database),
        _measure_dependency("redis", check_redis),
    )
    dependencies = {"database": database, "redis": redis}
    is_ready = all(item["status"] == "healthy" for item in dependencies.values())

    payload = {
        "status": "ready" if is_ready else "not_ready",
        "service": "apex-f1-api",
        "timestamp": _utc_timestamp(),
        "dependencies": dependencies,
    }

    if not is_ready:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload,
        )

    return payload

@router.get("/system")
async def system_diagnostics(session: DBSession):
    """
    Operational diagnostics for observability.
    Includes versioning, degradation states, and recent health events.
    """
    async def load_recent_events():
        stmt = select(PlatformHealth).order_by(desc(PlatformHealth.timestamp)).limit(5)
        result = await session.execute(stmt)
        return result.scalars().all()

    try:
        recent_events = await asyncio.wait_for(
            load_recent_events(),
            timeout=HEALTHCHECK_TIMEOUT_SECONDS,
        )
        database_status = "healthy"
    except Exception:
        recent_events = []
        database_status = "unhealthy"

    is_degraded = any(e.status == "CRITICAL" for e in recent_events)

    async def check_redis():
        await redis_client.ping()

    redis_status = await _measure_dependency("redis", check_redis)

    return {
        "status": "DEGRADED" if is_degraded or database_status != "healthy" else "OPERATIONAL",
        "version": "3.5.0-hardened",
        "timestamp": _utc_timestamp(),
        "dependencies": {
            "database": {"name": "database", "status": database_status},
            "redis": redis_status,
        },
        "degraded": is_degraded or database_status != "healthy" or redis_status["status"] != "healthy",
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
