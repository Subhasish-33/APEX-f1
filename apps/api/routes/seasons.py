from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Annotated
from sqlalchemy import select, func
from dependencies import get_db
from models import Race, DriverStanding, ConstructorStanding, Driver
from schemas import RaceResponse, DriverStandingResponse, ConstructorStandingResponse, PaginatedResponse, SeasonIntelligenceResponse, UnifiedStandingsResponse
from cache import cached
from datetime import datetime
from analytics.intelligence_engine import PsychologicalEngine

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/seasons/{year}/races", response_model=PaginatedResponse[RaceResponse])
@cached(ttl=3600, key_prefix="season_races")
async def get_season_races(
    year: int,
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    total_count = await session.scalar(
        select(func.count()).select_from(Race).where(Race.year == year)
    )

    stmt = (
        select(Race)
        .where(Race.year == year)
        .options(selectinload(Race.circuit))
        .order_by(Race.round)
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    races = result.scalars().all()

    return {"total_count": total_count, "page": page, "limit": limit, "data": races}


@router.get("/seasons/{year}/standings/drivers", response_model=PaginatedResponse[DriverStandingResponse])
@cached(ttl=3600, key_prefix="season_driver_standings")
async def get_season_driver_standings(
    year: int,
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    from models import Result, Constructor
    
    # 1. Find the latest race of the year that has standings recorded
    latest_race_id = await session.scalar(
        select(Race.race_id)
        .join(DriverStanding, DriverStanding.race_id == Race.race_id)
        .where(Race.year == year)
        .order_by(Race.round.desc())
        .limit(1)
    )

    if not latest_race_id:
        return {"total_count": 0, "page": page, "limit": limit, "data": []}

    total_count = await session.scalar(
        select(func.count()).select_from(DriverStanding).where(DriverStanding.race_id == latest_race_id)
    )

    # We join with Result to get the constructor_id for this specific driver in this specific race
    stmt = (
        select(DriverStanding, Constructor)
        .join(Result, (Result.race_id == DriverStanding.race_id) & (Result.driver_id == DriverStanding.driver_id))
        .join(Constructor, Result.constructor_id == Constructor.constructor_id)
        .where(DriverStanding.race_id == latest_race_id)
        .options(selectinload(DriverStanding.driver))
        .order_by(DriverStanding.position)
        .offset(offset)
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    rows = result.all()
    
    standings = []
    for standing, constructor in rows:
        standing.constructor = constructor
        standings.append(standing)

    # 4. Calculate Freshness
    all_dates = [s.last_updated for s in standings if s.last_updated]
    freshness = max(all_dates) if all_dates else None

    return {
        "total_count": total_count, 
        "page": page, 
        "limit": limit, 
        "data": standings,
        "freshness": freshness
    }


@router.get("/seasons/{year}/standings/constructors", response_model=PaginatedResponse[ConstructorStandingResponse])
@cached(ttl=3600, key_prefix="season_constructor_standings")
async def get_season_constructor_standings(
    year: int,
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    latest_race_id = await session.scalar(
        select(Race.race_id)
        .join(ConstructorStanding, ConstructorStanding.race_id == Race.race_id)
        .where(Race.year == year)
        .order_by(Race.round.desc())
        .limit(1)
    )

    if not latest_race_id:
        return {"total_count": 0, "page": page, "limit": limit, "data": []}

    total_count = await session.scalar(
        select(func.count()).select_from(ConstructorStanding).where(ConstructorStanding.race_id == latest_race_id)
    )

    stmt = (
        select(ConstructorStanding)
        .where(ConstructorStanding.race_id == latest_race_id)
        .options(selectinload(ConstructorStanding.constructor))
        .order_by(ConstructorStanding.position)
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    standings = result.scalars().all()

    # 4. Calculate Freshness
    all_dates = [c.last_updated for c in standings if c.last_updated]
    freshness = max(all_dates) if all_dates else None

    return {
        "total_count": total_count, 
        "page": page, 
        "limit": limit, 
        "data": standings,
        "freshness": freshness
    }


@router.get("/seasons/{year}/standings/unified", response_model=UnifiedStandingsResponse)
async def get_unified_standings(
    year: int,
    session: DBSession
):
    """
    Returns both Driver and Constructor standings for a given season.
    Includes Truth Verification metadata.
    """
    # 1. Find the latest race in that season that has results
    latest_race_stmt = (
        select(Race)
        .where(Race.year == year)
        .join(DriverStanding, Race.race_id == DriverStanding.race_id)
        .order_by(Race.round.desc())
        .limit(1)
    )
    latest_race = await session.scalar(latest_race_stmt)
    
    if not latest_race:
        return {
            "season": year,
            "status": "ARCHIVAL",
            "is_verified": False,
            "coverage_confidence": 0.0,
            "last_audit_at": datetime.utcnow(),
            "last_race_id": None,
            "last_race_name": None,
            "drivers": [], 
            "constructors": [],
            "freshness": datetime.utcnow()
        }

    latest_race_id = latest_race.race_id

    from models import Result, Season
    # 2. Get Season Metadata
    season_meta_stmt = select(Season).where(Season.year == year)
    season_meta = await session.scalar(season_meta_stmt)
    
    status = season_meta.status if season_meta else "ARCHIVAL"
    is_verified = season_meta.is_verified if season_meta else False
    confidence = season_meta.coverage_confidence if season_meta else 0.0
    audit_at = season_meta.last_audit_at if season_meta else datetime.utcnow()

    # 3. Get Driver Standings
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

    # 4. Get Constructor Standings
    constructors_stmt = (
        select(ConstructorStanding)
        .where(ConstructorStanding.race_id == latest_race_id)
        .options(selectinload(ConstructorStanding.constructor))
        .order_by(ConstructorStanding.position)
    )
    constructor_results = (await session.execute(constructors_stmt)).scalars().all()

    # 5. Calculate Freshness
    all_dates = [s.last_updated for s in driver_results if s.last_updated] + \
                [c.last_updated for c in constructor_results if c.last_updated]
    freshness = max(all_dates) if all_dates else datetime.utcnow()

    return {
        "season": year,
        "status": status,
        "is_verified": is_verified,
        "coverage_confidence": confidence,
        "last_audit_at": audit_at,
        "last_race_id": latest_race_id,
        "last_race_name": latest_race.name,
        "drivers": driver_results,
        "constructors": constructor_results,
        "freshness": freshness
    }


@router.get("/seasons/{year}/intelligence", response_model=SeasonIntelligenceResponse)
@cached(ttl=3600, key_prefix="season_intelligence")
async def get_season_intelligence(year: int, session: DBSession):
    engine = PsychologicalEngine(session)
    
    volatility = await engine.calculate_volatility(year)
    pressure = await engine.calculate_pressure_scores(year)
    rivalries = await engine.detect_rivalries(year)
    
    # Identify Season DNA (Simplified logic)
    total_races = await session.scalar(select(func.count()).select_from(Race).where(Race.year == year))
    avg_volatility = sum(volatility.values()) / len(volatility) if volatility else 0
    
    dna = "Technical Revolution"
    if avg_volatility > 0.6: dna = "Chaos Era"
    elif avg_volatility < 0.2: dna = "Dominance Era"
    elif len(rivalries) > 3: dna = "Psychological Warfare"

    # Tension Score calculation
    tension = min(100, (avg_volatility * 100) + (len(rivalries) * 10))

    return {
        "year": year,
        "dna": dna,
        "tension_score": tension,
        "volatility_index": volatility,
        "pressure_map": pressure,
        "rivalries": rivalries,
        "storylines": [
            f"The {dna} of {year} continues to unfold.",
            f"High pressure detected for {len([p for p in pressure.values() if p > 80])} drivers."
        ]
    }
