import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from models import Driver, Result, Race, Qualifying
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, PaginationSchema
from core.exceptions import ResourceNotFoundException

class DriverService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_drivers(self, page: int, limit: int) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        offset = (page - 1) * limit

        total_count = await self.db.scalar(select(func.count()).select_from(Driver))
        
        stmt = select(Driver).order_by(Driver.driver_id).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        drivers = result.scalars().all()
        
        # Serialize to dicts for generic response wrapper
        data = [{
            "driver_id": d.driver_id,
            "driver_ref": d.driver_ref,
            "code": d.code,
            "forename": d.forename,
            "surname": d.surname,
            "nationality": d.nationality
        } for d in drivers]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        has_next = (page * limit) < total_count

        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(),
            pagination=PaginationSchema(total=total_count, page=page, size=limit, has_next=has_next)
        )

    async def get_driver_by_ref(self, ref: str) -> ResponseEnvelope[Dict[str, Any]]:
        start_time = time.perf_counter()
        
        stmt = select(Driver).where(Driver.driver_ref == ref)
        driver = (await self.db.execute(stmt)).scalar_one_or_none()
        
        if not driver:
            raise ResourceNotFoundException(f"Driver '{ref}' not found.", context={"ref": ref})

        data = {
            "driver_id": driver.driver_id,
            "driver_ref": driver.driver_ref,
            "code": driver.code,
            "forename": driver.forename,
            "surname": driver.surname,
            "nationality": driver.nationality
        }

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(data=data, meta=MetaSchema(execution_ms=execution_ms))

    async def get_driver_career(self, ref: str) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        
        stmt = select(Driver.driver_id).where(Driver.driver_ref == ref)
        driver_id = await self.db.scalar(stmt)
        if not driver_id:
            raise ResourceNotFoundException(f"Driver '{ref}' not found.", context={"ref": ref})

        stats_stmt = (
            select(
                Race.year,
                func.count(Result.result_id).filter(Result.position == 1).label("wins"),
                func.count(Result.result_id).filter(Result.position <= 3).label("podiums"),
                func.count(Result.result_id).filter(Result.grid == 1).label("poles"),
                func.sum(Result.points).label("points")
            )
            .join(Race, Result.race_id == Race.race_id)
            .where(Result.driver_id == driver_id)
            .group_by(Race.year)
            .order_by(Race.year.desc())
        )
        
        result = await self.db.execute(stats_stmt)
        career_stats = result.all()
        
        data = [
            {
                "year": row.year,
                "wins": row.wins,
                "podiums": row.podiums,
                "poles": row.poles,
                "points": float(row.points or 0)
            } for row in career_stats
        ]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(data=data, meta=MetaSchema(execution_ms=execution_ms))
