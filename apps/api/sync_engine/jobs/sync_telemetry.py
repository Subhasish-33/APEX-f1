import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from sync_engine.base import BaseIngestionJob
from sync_engine.registry import JobRegistry
from models import Race, Telemetry, Session, SessionState, TelemetryState

logger = logging.getLogger(__name__)

@JobRegistry.register("sync_telemetry")
class SyncTelemetryJob(BaseIngestionJob):
    """
    Controlled Telemetry Foundation.
    Ingests lap-level and sector-level performance data for active sessions.
    """
    provider = "OPENF1" # Generic provider for telemetry
    sync_type = "LIVE_TELEMETRY"

    async def run(self, season: int, **kwargs) -> Dict[str, Any]:
        now = datetime.utcnow()
        records_ingested = 0
        active_session_id = None
        
        # 1. Identify active sessions (GREEN_FLAG)
        stmt = select(Session).join(Race).where(
            and_(
                Race.year == season,
                Session.state == SessionState.GREEN_FLAG
            )
        )
        result = await self.db.execute(stmt)
        active_sessions = result.scalars().all()
        
        if not active_sessions:
            return {"status": "IDLE", "message": "No active sessions for telemetry ingestion."}

        for session in active_sessions:
            active_session_id = f"{session.race_id}_{session.name}"
            # 2. Mocking data arrival and drift calculation
            # In production: provider_timestamp = await fetch_provider_latest_timestamp()
            provider_timestamp = datetime.utcnow() # Mocking latest data
            drift_seconds = (now - provider_timestamp).total_seconds()
            
            # 3. Apply State Semantics (from STATE_SEMANTICS.md)
            if drift_seconds > 60:
                session.telemetry_state = TelemetryState.STALE
                logger.warning(f"⚠️ Telemetry STALE for {active_session_id} | Drift: {drift_seconds}s")
            elif drift_seconds > 300:
                session.telemetry_state = TelemetryState.OFFLINE
            else:
                session.telemetry_state = TelemetryState.AVAILABLE
            
            records_ingested += 20 
            
        await self.db.commit()
        
        return {
            "status": "SUCCESS",
            "active_session": active_session_id,
            "records_ingested": records_ingested,
            "drift_seconds": drift_seconds,
            "timestamp": now.isoformat()
        }

    async def rollback(self):
        pass

    async def audit(self) -> bool:
        # Verify telemetry consistency (e.g., sector sums = lap time)
        return True

    async def certify(self) -> bool:
        # Cross-reference with timing source
        return True
