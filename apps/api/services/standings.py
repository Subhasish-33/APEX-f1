import time
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import DriverStanding, Race, Session, SessionState, Driver
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema, FreshnessState, CertificationState
from core.exceptions import ResourceNotFoundException
from core.supabase import supabase # Plan B Client

logger = logging.getLogger(__name__)

class StandingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_driver_standings(self, season: int) -> ResponseEnvelope[List[Dict[str, Any]]]:
        start_time = time.perf_counter()
        
        try:
            # PLAN B: Try Supabase SDK (HTTPS)
            # 1. Get latest race for season
            race_res = supabase.table("races").select("race_id").eq("year", season).order("round", desc=True).limit(1).execute()
            if not race_res.data:
                 raise ResourceNotFoundException(f"No standings found for season {season}")
            
            latest_race_id = race_res.data[0]["race_id"]

            # 2. Get standings with driver_ref join
            standings_res = supabase.table("driver_standings").select("position, points, wins, drivers(driver_ref)").eq("race_id", latest_race_id).order("position").execute()
            
            data = []
            for item in standings_res.data:
                data.append({
                    "driver_ref": item["drivers"]["driver_ref"],
                    "position": item["position"],
                    "points": item["points"],
                    "wins": item["wins"]
                })
            
            freshness = FreshnessState.HISTORICAL
            certification = CertificationState.CERTIFIED
            
        except Exception as e:
            logger.warning(f"Plan B failed for standings: {e}")
            # FALLBACK to SQLAlchemy
            latest_race_stmt = select(Race.race_id).where(Race.year == season).order_by(Race.round.desc()).limit(1)
            latest_race_id = await self.db.scalar(latest_race_stmt)
            
            if not latest_race_id:
                raise ResourceNotFoundException(message=f"No standings found for season {season}")

            stmt = (
                select(DriverStanding, Driver.driver_ref)
                .join(Driver, Driver.driver_id == DriverStanding.driver_id)
                .where(DriverStanding.race_id == latest_race_id)
                .order_by(DriverStanding.position)
            )
            results = (await self.db.execute(stmt)).all()
            
            data = []
            for r, driver_ref in results:
                data.append({
                    "driver_ref": driver_ref,
                    "position": r.position,
                    "points": r.points,
                    "wins": r.wins
                })
            freshness = FreshnessState.HISTORICAL
            certification = CertificationState.CERTIFIED

        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema(freshness=freshness, certification=certification, degraded=False)
        )
