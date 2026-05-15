import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models import Constructor, ConstructorStanding, Race
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, PaginationSchema
from core.exceptions import ResourceNotFoundException

class ConstructorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_constructors(self, page: int, limit: int) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        offset = (page - 1) * limit

        total_count = await self.db.scalar(select(func.count()).select_from(Constructor))
        
        stmt = select(Constructor).order_by(Constructor.constructor_id).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        constructors = result.scalars().all()
        
        data = [{
            "constructor_id": c.constructor_id,
            "constructor_ref": c.constructor_ref,
            "name": c.name,
            "nationality": c.nationality,
            "url": c.url
        } for c in constructors]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        has_next = (page * limit) < total_count

        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(),
            pagination=PaginationSchema(total=total_count, page=page, size=limit, has_next=has_next)
        )

    async def get_constructor_by_ref(self, ref: str) -> ResponseEnvelope[Dict[str, Any]]:
        start_time = time.perf_counter()
        
        stmt = select(Constructor).where(Constructor.constructor_ref == ref)
        constructor = (await self.db.execute(stmt)).scalar_one_or_none()
        
        if not constructor:
            raise ResourceNotFoundException(f"Constructor '{ref}' not found.", context={"ref": ref})

        data = {
            "constructor_id": constructor.constructor_id,
            "constructor_ref": constructor.constructor_ref,
            "name": constructor.name,
            "nationality": constructor.nationality,
            "url": constructor.url
        }

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(data=data, meta=MetaSchema(execution_ms=execution_ms))

    async def get_constructor_history(self, ref: str) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        
        stmt = select(Constructor.constructor_id).where(Constructor.constructor_ref == ref)
        constructor_id = await self.db.scalar(stmt)
        if not constructor_id:
            raise ResourceNotFoundException(f"Constructor '{ref}' not found.", context={"ref": ref})

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
        
        result = await self.db.execute(stmt)
        history = result.all()
        
        data = [
            {
                "year": h.year,
                "points": float(h.points or 0),
                "position": h.position,
                "wins": h.wins
            } for h in history
        ]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(data=data, meta=MetaSchema(execution_ms=execution_ms))
