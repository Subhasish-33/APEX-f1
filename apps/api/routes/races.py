from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, Any, List
from dependencies import get_db
from cache import cached
from services.races import RaceService
from schemas.envelope import ResponseEnvelope

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/races", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@cached(ttl=3600, key_prefix="races_list")
async def get_races(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    service = RaceService(session)
    return await service.get_races(page=page, limit=limit)

@router.get("/races/{slug}", response_model=ResponseEnvelope[Dict[str, Any]])
@cached(ttl=360, key_prefix="race_slug")
async def get_race_by_slug(slug: str, session: DBSession):
    service = RaceService(session)
    return await service.get_race_by_slug(slug)
