import time
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Session, SessionState, Race
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, FreshnessState, CertificationState
from core.exceptions import ResourceNotFoundException

from live_engine import (
    SessionStateEngine,
    IntervalTracker,
    TireStateTracker,
    SectorTracker,
    LifecycleState
)

# Global canonical live state engine singleton for the session context
_session_engine = SessionStateEngine()

class LiveService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_active_session(self):
        stmt = (
            select(Session, Race)
            .join(Race)
            .where(Session.state.in_([SessionState.GREEN_FLAG, SessionState.RED_FLAG, SessionState.YELLOW_FLAG]))
            .order_by(Session.id.desc())
            .limit(1)
        )
        result = (await self.db.execute(stmt)).first()
        return result

    async def get_live_timing(self) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        active_session_row = await self._get_active_session()

        if not active_session_row:
            raise ResourceNotFoundException("No active session currently running.")

        session_model, race = active_session_row
        
        # Mocking an update from the provider ingestion worker
        _session_engine.update_session_state(
            state=LifecycleState(session_model.state.name),
            flag="GREEN" if session_model.state == SessionState.GREEN_FLAG else "YELLOW",
            laps=24,
            last_sync=time.time() - 2.5 # Simulating a 2.5s old telemetry frame
        )

        # Raw mocked telemetry from the provider
        raw_telemetry = [
            {"driver_ref": "VER", "position": 1, "total_time_ms": 3600000, "status": "ON_TRACK"},
            {"driver_ref": "LEC", "position": 2, "total_time_ms": 3601234, "status": "ON_TRACK"},
            {"driver_ref": "NOR", "position": 3, "total_time_ms": 3604500, "status": "ON_TRACK"},
            {"driver_ref": "HAM", "position": 4, "total_time_ms": 3615000, "status": "PIT_LANE"}
        ]
        
        # Augment with temporal logic (Tier 4.2)
        augmented_telemetry = IntervalTracker.compute_leaderboard_gaps(raw_telemetry)
        
        # Augment with tire intelligence
        for d in augmented_telemetry:
            tire_info = TireStateTracker.augment_tire_state(
                driver_ref=d["driver_ref"], 
                current_compound="MEDIUM", 
                stint_laps=12,
                has_official_telemetry=True
            )
            d["tire"] = tire_info

        # Retrieve the canonical temporal truth
        temporal_context = _session_engine.get_live_operational_context()
        
        freshness_val = FreshnessState.LIVE
        if temporal_context["telemetry"]["freshness"] == "STALE":
            freshness_val = FreshnessState.STALE
        elif temporal_context["telemetry"]["freshness"] == "HISTORICAL":
            freshness_val = FreshnessState.HISTORICAL
            
        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return ResponseEnvelope(
            data=augmented_telemetry,
            meta=MetaSchema(execution_ms=execution_ms, version="v1.1_live"),
            state=StateSchema(
                freshness=freshness_val, 
                certification=CertificationState.UNVERIFIED, 
                degraded=temporal_context["overall_degraded"]
            )
        )

    async def get_live_leaderboard(self) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        active_session_row = await self._get_active_session()

        if not active_session_row:
            # Explicit degradation logic from Tier 3
            return await self._get_degraded_leaderboard(start_time)

        # Same temporal rigor applies to the leaderboard
        session_model, race = active_session_row
        _session_engine.update_session_state(
            state=LifecycleState(session_model.state.name),
            flag="GREEN",
            laps=24,
            last_sync=time.time() - 2.5
        )

        data = [
            {"position": 1, "driver_ref": "VER", "team_ref": "red_bull", "pits": 1, "gap": "LEADER"},
            {"position": 2, "driver_ref": "LEC", "team_ref": "ferrari", "pits": 1, "gap": "+1.234s"},
        ]

        temporal_context = _session_engine.get_live_operational_context()

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(
                freshness=FreshnessState.LIVE if not temporal_context["overall_degraded"] else FreshnessState.STALE, 
                certification=CertificationState.UNVERIFIED, 
                degraded=temporal_context["overall_degraded"]
            )
        )

    async def _get_degraded_leaderboard(self, start_time: float) -> ResponseEnvelope[List[Dict[str, Any]]]:
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
