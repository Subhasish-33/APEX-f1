from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List
from dependencies import get_db
from sqlalchemy import select, desc
from models import PlatformHealth
from schemas import PlatformHealthResponse
from datetime import datetime

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/platform", response_model=List[PlatformHealthResponse])
async def get_platform_health(
    session: DBSession,
    limit: int = 10
):
    """
    Returns the latest platform health events.
    Used for the observability layer.
    """
    stmt = select(PlatformHealth).order_by(desc(PlatformHealth.timestamp)).limit(limit)
    result = await session.execute(stmt)
    health_events = result.scalars().all()
    return health_events

@router.get("/status")
async def get_overall_status(session: DBSession):
    """
    Deterministic system status based on recent health logs and ingestion drift.
    """
    # Check for any CRITICAL events in the last 24 hours
    # (Simplified for now, just checking last 5)
    stmt = select(PlatformHealth).order_by(desc(PlatformHealth.timestamp)).limit(5)
    result = await session.execute(stmt)
    recent = result.scalars().all()
    
    status = "OPERATIONAL"
    for event in recent:
        if event.status == "CRITICAL":
            status = "DEGRADED"
            break
            
    return {
        "status": status,
        "timestamp": datetime.utcnow(),
        "version": "3.0.0-phase3",
        "engine": "Apex-Intelligence-V2"
    }
