from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from sqlalchemy import select, func
from dependencies import get_db
from models import Driver, Result, Race, Qualifying
from schemas import DriverResponse, PaginatedResponse
from cache import cached

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/drivers", response_model=PaginatedResponse[DriverResponse])
@cached(ttl=3600, key_prefix="drivers")
async def get_drivers(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    total_count = await session.scalar(select(func.count()).select_from(Driver))

    stmt = select(Driver).order_by(Driver.driver_id).offset(offset).limit(limit)
    result = await session.execute(stmt)
    drivers = result.scalars().all()

    return {"total_count": total_count, "page": page, "limit": limit, "data": drivers}


@router.get("/drivers/{ref}", response_model=DriverResponse)
@cached(ttl=3600, key_prefix="driver_ref")
async def get_driver_by_ref(ref: str, session: DBSession):
    stmt = select(Driver).where(Driver.driver_ref == ref)
    result = await session.execute(stmt)
    driver = result.scalar_one_or_none()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    return driver

@router.get("/drivers/{ref}/career")
@cached(ttl=3600, key_prefix="driver_career")
async def get_driver_career(ref: str, session: DBSession):
    """
    Returns season-by-season career metrics for a driver.
    Includes: wins, podiums, poles, points, and final position.
    """
    # Get driver_id
    stmt = select(Driver.driver_id).where(Driver.driver_ref == ref)
    driver_id = await session.scalar(stmt)
    if not driver_id:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Aggregate stats per season
    # Wins: position = 1
    # Podiums: position <= 3
    # Poles: grid = 1
    
    stmt = (
        select(
            Race.year,
            func.count(Result.result_id).filter(Result.position == 1).label("wins"),
            func.count(Result.result_id).filter(Result.position <= 3).label("podiums"),
            func.count(Result.result_id).filter(Result.grid == 1).label("poles"),
            func.sum(Result.points).label("points")
        )
        .join(Race, Result.race_id == Race.race_id)
        .where(Result.driver_id == driver_id)
        .group_by(Race.year)
        .order_by(Race.year.desc())
    )
    
    result = await session.execute(stmt)
    career_stats = result.all()
    
    return [
        {
            "year": row.year,
            "wins": row.wins,
            "podiums": row.podiums,
            "poles": row.poles,
            "points": float(row.points or 0)
        } for row in career_stats
    ]

@router.get("/drivers/{ref}/results")
@cached(ttl=3600, key_prefix="driver_results")
async def get_driver_results(ref: str, session: DBSession, limit: int = 5):
    """Returns the most recent race results for a driver."""
    from models import Constructor
    
    stmt = select(Driver.driver_id).where(Driver.driver_ref == ref)
    driver_id = await session.scalar(stmt)
    if not driver_id:
        raise HTTPException(status_code=404, detail="Driver not found")

    stmt = (
        select(Result)
        .join(Race, Result.race_id == Race.race_id)
        .where(Result.driver_id == driver_id)
        .options(
            selectinload(Result.race).selectinload(Race.circuit),
            selectinload(Result.constructor)
        )
        .order_by(Race.date.desc())
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    results = result.scalars().all()
    
    return results

@router.get("/drivers/{ref}/teammate-duel")
@cached(ttl=3600, key_prefix="driver_teammate_duel")
async def get_teammate_duel(ref: str, session: DBSession, year: int = 2024):
    """Calculates head-to-head record against teammate for a season."""
    from models import Constructor
    
    # 1. Get driver_id and current constructor for the year
    stmt = (
        select(Driver.driver_id, Result.constructor_id)
        .join(Result, Driver.driver_id == Result.driver_id)
        .join(Race, Result.race_id == Race.race_id)
        .where(Driver.driver_ref == ref, Race.year == year)
        .limit(1)
    )
    res = await session.execute(stmt)
    row = res.first()
    if not row:
        return {"teammate": None, "race_h2h": [0, 0], "qualifying_h2h": [0, 0]}
    
    driver_id, constructor_id = row
    
    # 2. Find the teammate (the other driver for the same constructor in the same year)
    teammate_stmt = (
        select(Driver)
        .join(Result, Driver.driver_id == Result.driver_id)
        .join(Race, Result.race_id == Race.race_id)
        .where(Result.constructor_id == constructor_id, Race.year == year, Driver.driver_id != driver_id)
        .group_by(Driver.driver_id)
        .order_by(func.count(Result.result_id).desc())
        .limit(1)
    )
    teammate = await session.scalar(teammate_stmt)
    if not teammate:
        return {"teammate": None, "race_h2h": [0, 0], "qualifying_h2h": [0, 0]}

    # 3. Calculate Race H2H
    # Get all races where both finished
    race_stmt = text("""
        SELECT 
            r1.position as d1_pos, 
            r2.position as d2_pos
        FROM results r1
        JOIN results r2 ON r1.race_id = r2.race_id
        JOIN races ra ON r1.race_id = ra.race_id
        WHERE r1.driver_id = :d1 AND r2.driver_id = :d2 
        AND ra.year = :year
        AND r1.position IS NOT NULL AND r2.position IS NOT NULL
    """)
    race_res = await session.execute(race_stmt, {"d1": driver_id, "d2": teammate.driver_id, "year": year})
    race_scores = [0, 0] # [driver, teammate]
    for row in race_res:
        if row.d1_pos < row.d2_pos: race_scores[0] += 1
        elif row.d2_pos < row.d1_pos: race_scores[1] += 1

    # 4. Calculate Qualifying H2H
    qual_stmt = text("""
        SELECT 
            q1.position as d1_pos, 
            q2.position as d2_pos
        FROM qualifying q1
        JOIN qualifying q2 ON q1.race_id = q2.race_id
        JOIN races ra ON q1.race_id = q2.race_id
        WHERE q1.driver_id = :d1 AND q2.driver_id = :d2 
        AND ra.year = :year
    """)
    qual_res = await session.execute(qual_stmt, {"d1": driver_id, "d2": teammate.driver_id, "year": year})
    qual_scores = [0, 0]
    for row in qual_res:
        if row.d1_pos < row.d2_pos: qual_scores[0] += 1
        elif row.d2_pos < row.d1_pos: qual_scores[1] += 1

    return {
        "teammate": teammate,
        "race_h2h": race_scores,
        "qualifying_h2h": qual_scores,
        "year": year
    }