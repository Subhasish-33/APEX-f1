from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, List
from dependencies import get_db
from sqlalchemy import select
from models import DriverStanding, Race
from schemas import DriverStandingResponse, ConstructorStandingResponse
from cache import cached

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/standings/drivers")
@cached(ttl=3600, key_prefix="driver_standings")
async def driver_standings(session: DBSession, season: int = Query(2024)):
    # Legacy support / detail view
    latest_race_stmt = select(Race.race_id).where(Race.year == season).order_by(Race.round.desc()).limit(1)
    latest_race_id = await session.scalar(latest_race_stmt)
    
    if not latest_race_id: return []

    stmt = select(DriverStanding).where(DriverStanding.race_id == latest_race_id).order_by(DriverStanding.position)
    results = (await session.execute(stmt)).scalars().all()
    return results