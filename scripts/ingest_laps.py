import asyncio
import structlog
from sqlalchemy import select
from apps.api.db import async_session, init_db
from apps.api.models import LapTime, Race, Driver
import random

logger = structlog.get_logger()

async def simulate_lap_data():
    """Generates simulated lap-by-lap data for Race 1144 (Abu Dhabi) for MVP replay."""
    logger.info("Initializing DB and generating simulated lap data...")
    await init_db()
    
    async with async_session() as session:
        # Check if already generated
        stmt = select(LapTime).limit(1)
        res = await session.execute(stmt)
        if res.scalar():
            logger.info("Lap data already exists. Skipping ingestion.")
            return

        # Fetch a valid race_id from 2023 or the latest race
        stmt = select(Race.race_id).order_by(Race.year.desc(), Race.round.desc()).limit(1)
        res = await session.execute(stmt)
        race_id = res.scalar()
        
        if not race_id:
            logger.error("No races found in the database. Run Day 3 ingestion first.")
            return

        logger.info(f"Using Race ID {race_id} for simulation data.")
        
        # Ensure drivers exist, get first 10 drivers
        stmt_d = select(Driver.driver_id).limit(10)
        res_d = await session.execute(stmt_d)
        driver_ids = res_d.scalars().all()
        
        if len(driver_ids) < 10:
             logger.error("Not enough drivers found.")
             return
        total_laps = 58
        
        # Initial positions
        positions = {d: i+1 for i, d in enumerate(driver_ids)}
        
        lap_records = []
        for lap in range(1, total_laps + 1):
            # Simulate overtakes
            if lap % 3 == 0:
                # Random swap
                d1, d2 = random.sample(driver_ids[:5], 2)
                positions[d1], positions[d2] = positions[d2], positions[d1]
                
            for d_id in driver_ids:
                pos = positions[d_id]
                base_ms = 85000 # 1m25s
                ms = base_ms + (pos * 500) + random.randint(-200, 200)
                
                lt = LapTime(
                    race_id=race_id,
                    driver_id=d_id,
                    lap=lap,
                    position=pos,
                    time=f"1:{ms // 1000 % 60}.{ms % 1000}",
                    milliseconds=ms
                )
                session.add(lt)
                lap_records.append(lt)
                
        await session.commit()
        logger.info(f"Inserted {len(lap_records)} simulated lap records for Race {race_id}.")

if __name__ == "__main__":
    asyncio.run(simulate_lap_data())
