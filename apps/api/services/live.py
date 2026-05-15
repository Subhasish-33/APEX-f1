import time
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Session, SessionState, Race
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, FreshnessState, CertificationState
from core.exceptions import ServiceDegradedException, ResourceNotFoundException

class LiveService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_active_session(self):
        stmt = (
            select(Session, Race)
            .join(Race)
            .where(Session.state.in_([SessionState.GREEN_FLAG, SessionState.RED_FLAG]))
            .order_by(Session.session_key.desc())
            .limit(1)
        )
        result = (await self.db.execute(stmt)).first()
        return result

    async def get_live_timing(self) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        active_session_row = await self._get_active_session()

        if not active_session_row:
            raise ResourceNotFoundException("No active session currently running.")

        session, race = active_session_row
        
        # Placeholder for real live timing fetch from Telemetry buffer
        # Here we mock the behavior for the API Service layer contract
        
        data = [
            {"driver_ref": "VER", "position": 1, "last_lap": "1:32.456", "interval": "LEADER", "status": "ON_TRACK"},
            {"driver_ref": "LEC", "position": 2, "last_lap": "1:32.600", "interval": "+1.234", "status": "ON_TRACK"},
        ]
        
        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=FreshnessState.LIVE, certification=CertificationState.UNVERIFIED, degraded=False)
        )

    async def get_live_leaderboard(self) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        active_session_row = await self._get_active_session()

        if not active_session_row:
            # If no live session, degrade gracefully to the latest results
            return await self._get_degraded_leaderboard(start_time)

        session, race = active_session_row
        
        # Placeholder for live leaderboard
        data = [
            {"position": 1, "driver_ref": "VER", "team_ref": "red_bull", "pits": 1},
            {"position": 2, "driver_ref": "LEC", "team_ref": "ferrari", "pits": 1},
        ]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=FreshnessState.LIVE, certification=CertificationState.UNVERIFIED, degraded=False)
        )

    async def _get_degraded_leaderboard(self, start_time: float) -> ResponseEnvelope[List[Dict[str, Any]]]:
        # Return the last known completed race results
        from models import Result
        
        latest_race_stmt = select(Race.race_id).where(Race.state == 'COMPLETED').order_by(Race.date.desc()).limit(1)
        latest_race_id = await self.db.scalar(latest_race_stmt)
        
        if not latest_race_id:
            raise ResourceNotFoundException("No live session or historical fallback found.")

        stmt = select(Result).where(Result.race_id == latest_race_id).order_by(Result.position).limit(20)
        results = (await self.db.execute(stmt)).scalars().all()
        
        data = [
            {"position": r.position, "driver_id": r.driver_id, "points": r.points, "status": r.status}
            for r in results
        ]

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=FreshnessState.STALE, certification=CertificationState.PROVISIONAL, degraded=True)
        )
