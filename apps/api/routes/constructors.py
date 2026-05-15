from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, Any, List
from dependencies import get_db
from cache import governed_cache, CacheTier
from services.constructors import ConstructorService
from schemas.envelope import ResponseEnvelope

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/constructors", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@governed_cache(domain="constructors", tier=CacheTier.WARM)
async def get_constructors(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    service = ConstructorService(session)
    return await service.get_constructors(page=page, limit=limit)

@router.get("/constructors/{ref}", response_model=ResponseEnvelope[Dict[str, Any]])
@governed_cache(domain="constructor_ref", tier=CacheTier.STATIC)
async def get_constructor_by_ref(ref: str, session: DBSession):
    service = ConstructorService(session)
    return await service.get_constructor_by_ref(ref)

@router.get("/constructors/{ref}/history", response_model=ResponseEnvelope[List[Dict[str, Any]]])
@governed_cache(domain="constructor_history", tier=CacheTier.STATIC)
async def get_constructor_history(ref: str, session: DBSession):
    service = ConstructorService(session)
    return await service.get_constructor_history(ref)
