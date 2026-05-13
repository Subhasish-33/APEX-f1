from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, List
from dependencies import get_db
from sqlalchemy import text, select, func
from sqlalchemy.orm import selectinload
from models import DriverStanding, ConstructorStanding, Race, Driver, Constructor
from schemas import DriverStandingResponse, ConstructorStandingResponse
from cache import cached

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/standings")
@cached(ttl=3600, key_prefix="unified_standings")
async def get_unified_standings(
    session: DBSession,
    season: int = Query(2024)
):
    """
    Returns both Driver and Constructor standings for a given season.
    Optimized for the homepage dashboard to reduce round-trips.
    """
    # 1. Find the latest race in that season that has results
    latest_race_stmt = (
        select(Race.race_id)
        .where(Race.year == season)
        .join(DriverStanding, Race.race_id == DriverStanding.race_id)
        .order_by(Race.round.desc())
        .limit(1)
    )
    latest_race_id = await session.scalar(latest_race_stmt)
    
    if not latest_race_id:
        return {"season": season, "drivers": [], "constructors": []}

    from models import Result
    # 2. Get Driver Standings
    drivers_stmt = (
        select(DriverStanding, Constructor)
        .join(Result, (Result.race_id == DriverStanding.race_id) & (Result.driver_id == DriverStanding.driver_id))
        .join(Constructor, Result.constructor_id == Constructor.constructor_id)
        .where(DriverStanding.race_id == latest_race_id)
        .options(selectinload(DriverStanding.driver))
        .order_by(DriverStanding.position)
    )
    rows = (await session.execute(drivers_stmt)).all()
    driver_results = []
    for standing, constructor in rows:
        standing.constructor = constructor
        driver_results.append(standing)

    # 3. Get Constructor Standings
    constructors_stmt = (
        select(ConstructorStanding)
        .where(ConstructorStanding.race_id == latest_race_id)
        .options(selectinload(ConstructorStanding.constructor))
        .order_by(ConstructorStanding.position)
    )
    constructor_results = (await session.execute(constructors_stmt)).scalars().all()

    return {
        "season": season,
        "drivers": driver_results,
        "constructors": constructor_results
    }

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