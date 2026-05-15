from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from dependencies import get_db
from cache import governed_cache, CacheTier
from services.standings import StandingsService

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/standings/drivers")
@governed_cache(domain="driver_standings", tier=CacheTier.WARM)
async def driver_standings(session: DBSession, season: int = Query(2024)):
    service = StandingsService(session)
    response_envelope = await service.get_driver_standings(season)
    return response_envelope