import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import text

from core import fetch_all, logger, engine, CURRENT_YEAR, get_driver_id, get_constructor_id
from models import Result, Race

async def ingest_results_for_year(year: int):
    logger.info(f"PHASE 2: Ingesting Results (Tier 1 Facts) for {year}...")
    items = await fetch_all(f"{year}/results.json", ["RaceTable", "Races"])
    if not items:
        return

    async with AsyncSession(engine) as s:
        for r in items:
            round_num = int(r.get("round"))
            race_id = round_num + year * 100
            
            # Verify race exists in skeleton
            res = await s.execute(text("SELECT race_id FROM races WHERE race_id = :rid"), {"rid": race_id})
            if not res.fetchone():
                logger.warning(f"Race ID {race_id} not found in skeleton. Skipping.")
                continue

            for res_data in r.get("Results", []):
                d_id = await get_driver_id(s, res_data.get("Driver", {}).get("driverId"))
                c_id = await get_constructor_id(s, res_data.get("Constructor", {}).get("constructorId"))
                
                if not d_id or not c_id:
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
                
                # Deterministic Conflict Resolution:
                # 1. If (race_id, driver_id) exists -> Update (Standard)
                # 2. If (race_id, position) exists -> Update (Prevents double winners)
                # PostgreSQL doesn't support multiple ON CONFLICT targets in one stmt easily,
                # but our sanitize script and uq constraints handle the physical safety.
                
                await s.execute(stmt.on_conflict_do_update(
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
        await s.commit()

async def main():
    # Targeted backfill for recent years to restore truth quickly
    for year in range(2023, 2025):
        await ingest_results_for_year(year)
    print("🏁 Tier 1 Results hydrated.")

if __name__ == "__main__":
    asyncio.run(main())
