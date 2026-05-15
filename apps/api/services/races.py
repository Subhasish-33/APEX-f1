import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models import Race, Result, Qualifying, PitStop, Telemetry, RaceMoment, Session, SessionState
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, FreshnessState, CertificationState, PaginationSchema
from core.exceptions import ResourceNotFoundException

class RaceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_races(self, page: int, limit: int) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        offset = (page - 1) * limit

        total_count = await self.db.scalar(select(func.count()).select_from(Race))
        
        stmt = select(Race).options(selectinload(Race.circuit)).order_by(Race.date.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        races = result.scalars().all()
        
        data = [{
            "race_id": r.race_id,
            "year": r.year,
            "round": r.round,
            "name": r.name,
            "date": r.date.isoformat() if r.date else None,
            "time": r.time.isoformat() if r.time else None,
            "url": r.url,
            "circuit_ref": r.circuit.circuit_ref if r.circuit else None,
            "circuit_name": r.circuit.name if r.circuit else None
        } for r in races]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        has_next = (page * limit) < total_count

        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(),
            pagination=PaginationSchema(total=total_count, page=page, size=limit, has_next=has_next)
        )

    async def get_race_by_slug(self, slug_or_id: str) -> ResponseEnvelope[Dict[str, Any]]:
        start_time = time.perf_counter()
        
        try:
            race_id = int(slug_or_id)
            stmt = select(Race).where(Race.race_id == race_id)
        except ValueError:
            # Simple slug match based on name and year e.g. "2024-bahrain-grand-prix"
            parts = slug_or_id.split("-", 1)
            if len(parts) == 2 and parts[0].isdigit():
                year = int(parts[0])
                name = parts[1].replace("-", " ")
                stmt = select(Race).where(Race.year == year, func.lower(Race.name).like(f"%{name}%"))
            else:
                raise ResourceNotFoundException(f"Race '{slug_or_id}' not found.")

        stmt = stmt.options(
            selectinload(Race.circuit),
            selectinload(Race.results).selectinload(Result.driver),
            selectinload(Race.results).selectinload(Result.constructor),
        )
        
        race = (await self.db.execute(stmt)).scalars().first()
        if not race:
            raise ResourceNotFoundException(f"Race '{slug_or_id}' not found.")

        # Determine state
        latest_session_stmt = select(Session.state).where(Session.race_id == race.race_id).order_by(Session.session_key.desc()).limit(1)
        latest_state = await self.db.scalar(latest_session_stmt)
        
        certification = CertificationState.CERTIFIED
        freshness = FreshnessState.HISTORICAL
        
        if latest_state in [SessionState.GREEN_FLAG, SessionState.RED_FLAG]:
            freshness = FreshnessState.LIVE
            certification = CertificationState.UNVERIFIED
        elif latest_state in [SessionState.CHECKERED_FLAG, SessionState.RACE_OVER]:
            freshness = FreshnessState.STALE
            certification = CertificationState.PROVISIONAL

        data = {
            "race_id": race.race_id,
            "year": race.year,
            "round": race.round,
            "name": race.name,
            "date": race.date.isoformat() if race.date else None,
            "circuit": race.circuit.name if race.circuit else None,
            "results": [{
                "position": res.position,
                "driver": res.driver.driver_ref if res.driver else None,
                "constructor": res.constructor.constructor_ref if res.constructor else None,
                "points": res.points,
                "time": res.time
            } for res in race.results[:10]] # limit for summary
        }

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=freshness, certification=certification, degraded=False)
        )
