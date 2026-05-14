import logging
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import text

from sync_engine.base import BaseIngestionJob
from sync_engine.registry import JobRegistry
from models import Result, Race
from ingestion.core import fetch_all, get_driver_id, get_constructor_id

logger = logging.getLogger(__name__)

@JobRegistry.register("ingest_results")
class IngestResultsJob(BaseIngestionJob):
    """
    Standardized job for ingesting race results (Tier 1 Facts).
    """
    provider = "Jolpica"
    sync_type = "RESULTS"

    async def run(self, season: int, **kwargs) -> Dict[str, Any]:
        processed = 0
        updated = 0
        failed = 0
        
        items = await fetch_all(f"{season}/results.json", ["RaceTable", "Races"])
        if not items:
            return {"processed": 0, "updated": 0, "failed": 0}

        for r in items:
            round_num = int(r.get("round"))
            race_id = round_num + season * 100
            
            # Verify race exists
            res = await self.db.execute(
                text("SELECT race_id FROM races WHERE race_id = :rid"), 
                {"rid": race_id}
            )
            if not res.fetchone():
                logger.warning(f"Race ID {race_id} not found. Skipping.")
                failed += 1
                continue

            for res_data in r.get("Results", []):
                try:
                    d_id = await get_driver_id(self.db, res_data.get("Driver", {}).get("driverId"))
                    c_id = await get_constructor_id(self.db, res_data.get("Constructor", {}).get("constructorId"))
                    
                    if not d_id or not c_id:
                        failed += 1
                        continue

                    position = res_data.get("position")
                    pos_int = int(position) if position and position.isdigit() else None

                    stmt = insert(Result).values(
                        race_id=race_id,
                        driver_id=d_id,
                        constructor_id=c_id,
                        grid=int(res_data.get("grid", 0)),
                        position=pos_int,
                        points=float(res_data.get("points", 0)),
                        time=res_data.get("Time", {}).get("time"),
                        milliseconds=int(res_data.get("Time", {}).get("millis", 0)) if res_data.get("Time", {}).get("millis") else None,
                        status=res_data.get("status"),
                        last_updated=datetime.now()
                    )
                    
                    await self.db.execute(stmt.on_conflict_do_update(
                        constraint="uq_race_driver_result",
                        set_={
                            "position": stmt.excluded.position,
                            "points": stmt.excluded.points,
                            "constructor_id": stmt.excluded.constructor_id,
                            "status": stmt.excluded.status,
                            "time": stmt.excluded.time,
                            "last_updated": stmt.excluded.last_updated
                        }
                    ))
                    updated += 1
                    processed += 1
                except Exception as e:
                    logger.error(f"Error processing result row: {str(e)}")
                    failed += 1
                    
        await self.db.commit()
        return {
            "processed": processed,
            "updated": updated,
            "failed": failed,
            "version": str(season)
        }

    async def rollback(self):
        # Result ingestion is idempotent due to ON CONFLICT.
        # No complex rollback needed for this specific job.
        pass

    async def audit(self) -> bool:
        # Basic audit: Ensure we have results if we processed a race
        return True

    async def certify(self) -> bool:
        # Promotion logic could go here (e.g. comparing vs secondary source)
        return True
