import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def audit_integrity():
    print("--- APEX-F1 DETERMINISTIC AUDIT: INTEGRITY ---")
    engine = create_async_engine(DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.connect() as conn:
        # 1. Orphaned Results (No matching Race)
        orphans_res = await conn.execute(text("""
            SELECT count(*) FROM results r 
            LEFT JOIN races ra ON r.race_id = ra.race_id 
            WHERE ra.race_id IS NULL
        """))
        orphan_results_count = orphans_res.scalar()

        # 2. Duplicate Races (Year + Round Collision)
        dupe_races = await conn.execute(text("""
            SELECT year, round, count(*) 
            FROM races 
            GROUP BY year, round 
            HAVING count(*) > 1
        """))
        dupe_race_list = [{"year": row[0], "round": row[1], "count": row[2]} for row in dupe_races]

        # 3. Missing Entities (FK Check)
        missing_drivers = await conn.execute(text("""
            SELECT count(*) FROM results r 
            LEFT JOIN drivers d ON r.driver_id = d.driver_id 
            WHERE d.driver_id IS NULL
        """))
        missing_constructors = await conn.execute(text("""
            SELECT count(*) FROM results r 
            LEFT JOIN constructors c ON r.constructor_id = c.constructor_id 
            WHERE c.constructor_id IS NULL
        """))

        # 4. Inconsistent Constructor IDs (Driver changing teams in season vs Standing records)
        # (Simplified check for now)
        
        # Output
        print(f"Orphaned Results (Missing Race Ref): {orphan_results_count}")
        print(f"Duplicate Race Slots (Year/Round Collisions): {len(dupe_race_list)}")
        if dupe_race_list:
            print(f"Sample Dupes: {dupe_race_list[:3]}")
            
        print(f"\nEntity Reference Failures:")
        print(f" - Results with Missing Driver records: {missing_drivers.scalar()}")
        print(f" - Results with Missing Constructor records: {missing_constructors.scalar()}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_integrity())
