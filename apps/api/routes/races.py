from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Annotated, List
from sqlalchemy import select, func
from dependencies import get_db
from models import Race, Result, Qualifying, PitStop, Telemetry, RaceMoment
from schemas import RaceDetailResponse, RaceResponse, PaginatedResponse, TelemetryResponse
from sqlalchemy import select, func
from cache import cached

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/races", response_model=PaginatedResponse[RaceResponse])
@cached(ttl=3600, key_prefix="races_list")
async def get_races(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit
    total_count = await session.scalar(select(func.count()).select_from(Race))
    
    stmt = select(Race).options(selectinload(Race.circuit)).order_by(Race.date.desc()).offset(offset).limit(limit)
    result = await session.execute(stmt)
    races = result.scalars().all()
    
    return {"total_count": total_count, "page": page, "limit": limit, "data": races}


@router.get("/races/{id}", response_model=RaceDetailResponse)
@cached(ttl=3600, key_prefix="race_detail")
async def get_race_by_id(id: int, session: DBSession):
    stmt = (
        select(Race)
        .where(Race.race_id == id)
        .options(
            selectinload(Race.results).selectinload(Result.driver),
            selectinload(Race.results).selectinload(Result.constructor),
            selectinload(Race.qualifying).selectinload(Qualifying.driver),
            selectinload(Race.qualifying).selectinload(Qualifying.constructor),
            selectinload(Race.pit_stops).selectinload(PitStop.driver),
            selectinload(Race.moments).selectinload(RaceMoment.driver),
        )
    )
    result = await session.execute(stmt)
    race = result.scalar_one_or_none()

    if not race:
        raise HTTPException(status_code=404, detail="Race not found")

    return race
@router.get("/races/{id}/lap-times", response_model=List[TelemetryResponse])
@cached(ttl=3600, key_prefix="race_lap_times")
async def get_race_lap_times(id: int, session: DBSession):
    stmt = (
        select(Telemetry)
        .where(Telemetry.race_id == id)
        .order_by(Telemetry.lap_number, Telemetry.driver_id)
    )
    result = await session.execute(stmt)
    laps = result.scalars().all()
    return laps
