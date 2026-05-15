import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import DriverStanding, ConstructorStanding, Race, Session, SessionState
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, FreshnessState, CertificationState
from core.exceptions import ResourceNotFoundException

class StandingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_driver_standings(self, season: int) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        
        # Determine the target race (latest completed or live for the season)
        latest_race_stmt = select(Race.race_id).where(Race.year == season).order_by(Race.round.desc()).limit(1)
        latest_race_id = await self.db.scalar(latest_race_stmt)
        
        if not latest_race_id:
            raise ResourceNotFoundException(
                message=f"No standings found for season {season}",
                context={"season": season}
            )

        # Check latest session state to determine freshness/certification
        latest_session_stmt = select(Session.state).where(Session.race_id == latest_race_id).order_by(Session.session_key.desc()).limit(1)
        latest_state = await self.db.scalar(latest_session_stmt)
        
        certification = CertificationState.CERTIFIED
        freshness = FreshnessState.HISTORICAL
        
        if latest_state in [SessionState.GREEN_FLAG, SessionState.RED_FLAG]:
            freshness = FreshnessState.LIVE
            certification = CertificationState.UNVERIFIED
        elif latest_state in [SessionState.CHECKERED_FLAG, SessionState.RACE_OVER]:
            freshness = FreshnessState.STALE
            certification = CertificationState.PROVISIONAL

        # Fetch standings
        stmt = select(DriverStanding).where(DriverStanding.race_id == latest_race_id).order_by(DriverStanding.position)
        results = (await self.db.execute(stmt)).scalars().all()
        
        # Map to dicts (this is normally handled by a Pydantic Model layer, we'll serialize to raw dicts for generic response)
        # Assuming schemas exist, normally we'd return actual Pydantic schema types here, but dictionaries work for serialization via ResponseEnvelope
        data = []
        for r in results:
            data.append({
                "driver_ref": r.driver_ref,
                "position": r.position,
                "points": r.points,
                "wins": r.wins
            })

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=freshness, certification=certification, degraded=False)
        )
