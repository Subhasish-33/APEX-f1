from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, Any, List
from dependencies import get_db
from cache import governed_cache, CacheTier
from services.live import LiveService
from schemas.envelope import ResponseEnvelope

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/timing", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@governed_cache(domain="live_timing", tier=CacheTier.HOT)
async def get_live_timing(session: DBSession):
    service = LiveService(session)
    return await service.get_live_timing()

@router.get("/leaderboard", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@governed_cache(domain="live_leaderboard", tier=CacheTier.HOT)
async def get_live_leaderboard(session: DBSession):
    service = LiveService(session)
    return await service.get_live_leaderboard()
