import asyncio
import logging
from apps.api.ingestion.ingest import init_db, ingest_seasons, ingest_drivers, ingest_constructors, ingest_circuits, ingest_races, ingest_results, ingest_driver_standings, ingest_constructor_standings, ingest_qualifying, ingest_pit_stops
from apps.api.ingestion.ingest import logger, fetch

async def test_main():
    logger.info("🚀 Starting TEST ingestion for 2024...")
    await init_db()

    # Core tables
    await ingest_seasons()
    await ingest_drivers()
    await ingest_constructors()
    await ingest_circuits()
    
    # Modify loops to only do 2024 for testing
    # Note: We can't easily modify the functions without editing ingest.py, 
    # but we can monkeypatch or just run a limited set.
    # For now, I'll just run it as is but I'll stop it after some logs if it's too long.
    # Actually, I'll just run the whole thing since it's just 2010-2024 (15 years).
    
    await ingest_races()
    await ingest_results()
    await ingest_driver_standings()
    await ingest_constructor_standings()
    await ingest_qualifying()
    await ingest_pit_stops()

    logger.info("✅ TEST ingestion complete!")

if __name__ == "__main__":
    asyncio.run(test_main())
