from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Dict, Any
from dependencies import get_db
from schemas.envelope import ResponseEnvelope
from services.search import SearchService

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/search", response_model=ResponseEnvelope[Dict[str, Any]])
async def semantic_search(
    q: str,
    session: DBSession,
    semantic: bool = Query(True, description="Enable vector similarity search")
):
    service = SearchService(session)
    return await service.semantic_search(query=q)
