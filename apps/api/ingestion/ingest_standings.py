import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert

from core import logger, engine, CURRENT_YEAR
from models import DriverStanding, ConstructorStanding

async def recompute_standings_for_year(year: int):
    logger.info(f"PHASE 2: Recomputing Standings (Derived Truth) for {year}...")
    
    async with AsyncSession(engine) as s:
        # 1. Get all race IDs for the year ordered by round
        res = await s.execute(
            text("SELECT race_id, round FROM races WHERE year = :year ORDER BY round"),
            {"year": year}
        )
        races = res.fetchall()
        
        driver_running_totals = {} # driver_id -> points
        constructor_running_totals = {} # constructor_id -> points
        
        for race_id, round_num in races:
            # A. Update results for THIS race into totals
            # We query the Tier 1 Results table
            res_results = await s.execute(
                text("SELECT driver_id, constructor_id, points FROM results WHERE race_id = :rid"),
                {"rid": race_id}
            )
            race_results = res_results.fetchall()
            
            if not race_results:
                logger.debug(f"No results for race {race_id} (Round {round_num}). Skipping standings update.")
                continue

            for d_id, c_id, points in race_results:
                driver_running_totals[d_id] = driver_running_totals.get(d_id, 0.0) + points
                constructor_running_totals[c_id] = constructor_running_totals.get(c_id, 0.0) + points
            
            # B. Sort and Upsert Driver Standings
            sorted_drivers = sorted(driver_running_totals.items(), key=lambda x: x[1], reverse=True)
            for idx, (d_id, total) in enumerate(sorted_drivers):
                stmt = insert(DriverStanding).values(
                    race_id=race_id,
                    driver_id=d_id,
                    points=total,
                    position=idx + 1,
                    last_updated=datetime.now()
                )
                await s.execute(stmt.on_conflict_do_update(
                    constraint="uq_race_driver_standing",
                    set_={
                        "points": stmt.excluded.points, 
                        "position": stmt.excluded.position,
                        "last_updated": stmt.excluded.last_updated
                    }
                ))

            # C. Sort and Upsert Constructor Standings
            sorted_constructors = sorted(constructor_running_totals.items(), key=lambda x: x[1], reverse=True)
            for idx, (c_id, total) in enumerate(sorted_constructors):
                stmt = insert(ConstructorStanding).values(
                    race_id=race_id,
                    constructor_id=c_id,
                    points=total,
                    position=idx + 1,
                    last_updated=datetime.now()
                )
                await s.execute(stmt.on_conflict_do_update(
                    constraint="uq_race_constructor_standing",
                    set_={
                        "points": stmt.excluded.points, 
                        "position": stmt.excluded.position,
                        "last_updated": stmt.excluded.last_updated
                    }
                ))
            
            logger.info(f" - Round {round_num} standings recomputed.")
        
        await s.commit()

async def main():
    # Targeted recomputation for recent years
    for year in range(2023, 2025):
        await recompute_standings_for_year(year)
    print("🏁 Standings recomputed from Tier 1 Facts.")

if __name__ == "__main__":
    asyncio.run(main())
