import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_

from sync_engine.base import BaseIngestionJob
from sync_engine.registry import JobRegistry
from models import Race, Session, SessionState, TelemetryState

logger = logging.getLogger(__name__)

@JobRegistry.register("sync_live_weekend")
class SyncLiveWeekendJob(BaseIngestionJob):
    """
    Temporal awareness orchestrator. 
    Manages race/session state transitions based on time and provider metadata.
    """
    provider = "INTERNAL"
    sync_type = "LIVE_ORCHESTRATION"

    async def run(self, season: int, **kwargs) -> Dict[str, Any]:
        now = datetime.utcnow()
        updated_sessions = 0
        active_weekend = None
        
        # 1. Identify current or upcoming race (within a 7-day window)
        window_start = now - timedelta(days=4)
        window_end = now + timedelta(days=4)
        
        stmt = select(Race).where(
            and_(
                Race.year == season,
                Race.date >= window_start.date(),
                Race.date <= window_end.date()
            )
        )
        result = await self.db.execute(stmt)
        races = result.scalars().all()
        
        for race in races:
            active_weekend = race.name
            # Update session states based on time
            session_stmt = select(Session).where(Session.race_id == race.race_id)
            session_res = await self.db.execute(session_stmt)
            sessions = session_res.scalars().all()
            
            race_should_be_live = False
            
            for session in sessions:
                old_state = session.state
                
                # Simple time-based transition logic
                # In a real scenario, we'd also check provider 'live' flags here
                if session.date:
                    if now > (session.date + timedelta(hours=3)):
                        session.state = SessionState.COMPLETED
                    elif now > session.date:
                        session.state = SessionState.GREEN_FLAG
                        race_should_be_live = True
                    else:
                        session.state = SessionState.SCHEDULED
                
                if old_state != session.state:
                    updated_sessions += 1
                    logger.info(f"Session {session.name} transitioned: {old_state} -> {session.state}")

            # Update Race overall state
            if any(s.state == SessionState.GREEN_FLAG for s in sessions):
                race.state = SessionState.GREEN_FLAG
                race.telemetry_state = TelemetryState.AVAILABLE
            elif all(s.state == SessionState.COMPLETED for s in sessions):
                race.state = SessionState.COMPLETED
                race.telemetry_state = TelemetryState.AVAILABLE
            else:
                race.state = SessionState.SCHEDULED
                race.telemetry_state = TelemetryState.UNAVAILABLE
            
            race.last_updated = now

        await self.db.commit()
        
        return {
            "active_weekend": active_weekend,
            "sessions_transitioned": updated_sessions,
            "timestamp": now.isoformat()
        }

    async def rollback(self):
        pass

    async def audit(self) -> bool:
        return True

    async def certify(self) -> bool:
        return True
