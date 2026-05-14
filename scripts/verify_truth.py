import asyncio
import logging
from sqlalchemy import text
from ingestion.core import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VERIFIER")

async def verify_warehouse():
    async with engine.connect() as conn:
        logger.info("--- AUDITING CANONICAL TRUTH ---")
        
        # 1. Check 2024 Calendar Integrity
        res = await conn.execute(text("SELECT count(*) FROM races WHERE year = 2024"))
        count = res.scalar()
        logger.info(f"2024 Race Count: {count} (Target: 24)")
        
        # 2. Check for Duplicate Winners (Integrity Violation)
        res = await conn.execute(text("""
            SELECT race_id, count(*) 
            FROM results 
            WHERE position = 1 
            GROUP BY race_id 
            HAVING count(*) > 1
        """))
        dupes = res.fetchall()
        if dupes:
            logger.error(f"CRITICAL: Found {len(dupes)} races with multiple winners!")
        else:
            logger.info("Relational Integrity: PASS (No Double Winners)")

        # 3. Verify Derived Standings (Verstappen 2023)
        # We need to find the driver first
        res = await conn.execute(text("SELECT id FROM drivers WHERE driver_ref = 'max_verstappen'"))
        v_id = res.scalar()
        
        if v_id:
            res = await conn.execute(text(f"SELECT points FROM driver_standings WHERE driver_id = {v_id} AND year = 2023"))
            points = res.scalar()
            logger.info(f"Verstappen 2023 Points: {points} (Historical Target: 575.0)")
            if points == 575.0:
                logger.info("Mathematical Truth: PASS")
            else:
                logger.warning(f"Mathematical Drift Detected: {points} vs 575.0")
        else:
            logger.warning("Max Verstappen not found in warehouse.")

if __name__ == "__main__":
    asyncio.run(verify_warehouse())
