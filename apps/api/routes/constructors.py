from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from sqlalchemy import select, func
from apps.api.dependencies import get_db
from apps.api.models import Constructor, ConstructorStanding, Race
from apps.api.schemas import ConstructorResponse, PaginatedResponse, ConstructorHistoryEntry
from apps.api.cache import cached

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/constructors", response_model=PaginatedResponse[ConstructorResponse])
@cached(ttl=3600, key_prefix="constructors")
async def get_constructors(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    total_count = await session.scalar(select(func.count()).select_from(Constructor))

    stmt = select(Constructor).order_by(Constructor.constructor_id).offset(offset).limit(limit)
    result = await session.execute(stmt)
    constructors = result.scalars().all()

    return {"total_count": total_count, "page": page, "limit": limit, "data": constructors}


@router.get("/constructors/{ref}", response_model=ConstructorResponse)
@cached(ttl=3600, key_prefix="constructor_ref")
async def get_constructor_by_ref(ref: str, session: DBSession):
    stmt = select(Constructor).where(Constructor.constructor_ref == ref)
    result = await session.execute(stmt)
    constructor = result.scalar_one_or_none()

    if not constructor:
        raise HTTPException(status_code=404, detail="Constructor not found")

    return constructor


@router.get("/constructors/{ref}/history", response_model=list[ConstructorHistoryEntry])
@cached(ttl=3600, key_prefix="constructor_history")
async def get_constructor_history(ref: str, session: DBSession):
    # First get the constructor_id
    stmt = select(Constructor.constructor_id).where(Constructor.constructor_ref == ref)
    constructor_id = await session.scalar(stmt)
    if not constructor_id:
        raise HTTPException(status_code=404, detail="Constructor not found")

    # Get year-end standings
    # We find the max round for each year and get the standing for that race
    subq = (
        select(Race.year, func.max(Race.round).label("max_round"))
        .group_by(Race.year)
        .subquery()
    )
    
    stmt = (
        select(
            Race.year,
            ConstructorStanding.points,
            ConstructorStanding.position,
            ConstructorStanding.wins
        )
        .join(Race, ConstructorStanding.race_id == Race.race_id)
        .join(subq, (Race.year == subq.c.year) & (Race.round == subq.c.max_round))
        .where(ConstructorStanding.constructor_id == constructor_id)
        .order_by(Race.year)
    )
    
    result = await session.execute(stmt)
    history = result.all()
    
    return [
        {
            "year": h.year,
            "points": h.points,
            "position": h.position,
            "wins": h.wins
        } for h in history
    ]
