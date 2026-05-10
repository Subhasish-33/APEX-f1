from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from sqlalchemy import select, func
from dependencies import get_db
from models import Driver
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