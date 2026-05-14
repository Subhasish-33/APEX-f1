import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime

from core import fetch_all, logger, engine, CURRENT_YEAR
from models import Season, Race, Circuit

async def ingest_seasons():
    logger.info("PHASE 2: Ingesting Seasons (1950-2026)...")
    items = await fetch_all("seasons.json", ["SeasonTable", "Seasons"])
    
    # Ensure coverage through 2026
    target_years = set(range(1950, 2027))
    fetched_years = {int(d.get("season")) for d in items}
    all_years = target_years.union(fetched_years)
    
    async with AsyncSession(engine) as s:
        for year in sorted(all_years):
            stmt = insert(Season).values(year=year)
            await s.execute(stmt.on_conflict_do_nothing())
        await s.commit()
    logger.info(f"Seasons cataloged: {min(all_years)} -> {max(all_years)}")

async def ingest_races_for_year(year: int):
    logger.info(f"Ingesting race calendar for {year}...")
    items = await fetch_all(f"{year}.json", ["RaceTable", "Races"])
    if not items:
        return

    async with AsyncSession(engine) as s:
        for r in items:
            round_num = int(r.get("round"))
            race_id = round_num + year * 100
            
            # Basic race metadata
            # State logic: If date is in future, it's scheduled. 
            # We'll enhance this later with a dedicated 'status' column if needed,
            # but for now, we ensure the round/year unique constraint is respected.
            
            race_date = datetime.strptime(r.get("date"), "%Y-%m-%d").date()
            from core import get_race_status, INGESTION_VERSION
            status = get_race_status(race_date, year)
            
            stmt = insert(Race).values(
                race_id=race_id,
                year=year,
                round=round_num,
                circuit_id=r.get("Circuit", {}).get("circuitId"),
                name=r.get("raceName"),
                date=race_date,
                status=status,
                telemetry_available=(status == "COMPLETED" and year >= 2018),
                last_updated=datetime.now(),
                ingestion_version=INGESTION_VERSION,
                laps=int(r.get("laps")) if r.get("laps") and r.get("laps").isdigit() else None
            )
            
            # Idempotent upsert
            await s.execute(stmt.on_conflict_do_update(
                index_elements=["race_id"],
                set_={
                    "name": stmt.excluded.name,
                    "date": stmt.excluded.date,
                    "status": stmt.excluded.status,
                    "telemetry_available": stmt.excluded.telemetry_available,
                    "last_updated": stmt.excluded.last_updated,
                    "ingestion_version": stmt.excluded.ingestion_version,
                    "circuit_id": stmt.excluded.circuit_id,
                    "laps": stmt.excluded.laps
                }
            ))
        await s.commit()

async def main():
    await ingest_seasons()
    # Deep sync for 2024-2026, light sync for history
    for year in range(2020, 2027):
        await ingest_races_for_year(year)
    print("🏁 Season and Race skeletons reconstructed.")

if __name__ == "__main__":
    asyncio.run(main())
