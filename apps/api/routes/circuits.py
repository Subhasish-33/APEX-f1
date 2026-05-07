from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from sqlalchemy import select, func
from apps.api.dependencies import get_db
from apps.api.models import Circuit
from apps.api.schemas import CircuitResponse, PaginatedResponse
from apps.api.cache import cached

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/circuits", response_model=PaginatedResponse[CircuitResponse])
@cached(ttl=3600, key_prefix="circuits")
async def get_circuits(
    session: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    total_count = await session.scalar(select(func.count()).select_from(Circuit))

    stmt = select(Circuit).order_by(Circuit.circuit_id).offset(offset).limit(limit)
    result = await session.execute(stmt)
    circuits = result.scalars().all()

    return {"total_count": total_count, "page": page, "limit": limit, "data": circuits}
