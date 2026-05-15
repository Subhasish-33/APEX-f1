from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, Any, List
from dependencies import get_db
from cache import cached
from services.drivers import DriverService
from schemas.envelope import ResponseEnvelope

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/drivers", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@cached(ttl=3600, key_prefix="drivers")
async def get_drivers(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    service = DriverService(session)
    return await service.get_drivers(page=page, limit=limit)

@router.get("/drivers/{ref}", response_model=ResponseEnvelope[Dict[str, Any]])
@cached(ttl=3600, key_prefix="driver_ref")
async def get_driver_by_ref(ref: str, session: DBSession):
    service = DriverService(session)
    return await service.get_driver_by_ref(ref)

@router.get("/drivers/{ref}/career", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@cached(ttl=3600, key_prefix="driver_career")
async def get_driver_career(ref: str, session: DBSession):
    service = DriverService(session)
    return await service.get_driver_career(ref)