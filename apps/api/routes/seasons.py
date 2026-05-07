from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Annotated
from sqlalchemy import select, func
from apps.api.dependencies import get_db
from apps.api.models import Race, DriverStanding, ConstructorStanding
from apps.api.schemas import RaceResponse, DriverStandingResponse, ConstructorStandingResponse, PaginatedResponse
from apps.api.cache import cached

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

    stmt = select(Race).where(Race.year == year).order_by(Race.round).offset(offset).limit(limit)
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

    # Find the last race of the year that has standings recorded
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

    stmt = (
        select(DriverStanding)
        .where(DriverStanding.race_id == latest_race_id)
        .options(selectinload(DriverStanding.driver))
        .order_by(DriverStanding.position)
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    standings = result.scalars().all()

    return {"total_count": total_count, "page": page, "limit": limit, "data": standings}


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

    return {"total_count": total_count, "page": page, "limit": limit, "data": standings}
