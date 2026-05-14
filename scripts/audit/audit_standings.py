import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def audit_standings():
    print("--- APEX-F1 DETERMINISTIC AUDIT: STANDINGS ---")
    engine = create_async_engine(DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.connect() as conn:
        # 1. Reconciliation: Calculated Points vs Standing Points
        # We check the LATEST standing for each driver in a season and compare to sum of results
        reconcile_q = await conn.execute(text("""
            WITH calculated AS (
                SELECT 
                    ra.year,
                    r.driver_id,
                    SUM(r.points) as total_calc
                FROM results r
                JOIN races ra ON r.race_id = ra.race_id
                GROUP BY ra.year, r.driver_id
            ),
            official AS (
                SELECT 
                    ra.year,
                    ds.driver_id,
                    ds.points as total_off,
                    ds.position as final_pos,
                    ROW_NUMBER() OVER(PARTITION BY ra.year, ds.driver_id ORDER BY ra.round DESC) as rn
                FROM driver_standings ds
                JOIN races ra ON ds.race_id = ra.race_id
            )
            SELECT 
                c.year,
                c.driver_id,
                c.total_calc,
                o.total_off,
                (c.total_calc - o.total_off) as drift
            FROM calculated c
            JOIN official o ON c.year = o.year AND c.driver_id = o.driver_id
            WHERE o.rn = 1 AND ABS(c.total_calc - o.total_off) > 0.1
            ORDER BY drift DESC
        """))
        
        drifts = [{"year": row[0], "driver_id": row[1], "calc": row[2], "official": row[3], "drift": row[4]} for row in reconcile_q]

        # 2. Coverage: Races with results but NO standings
        missing_standings = await conn.execute(text("""
            SELECT DISTINCT r.race_id 
            FROM results r
            LEFT JOIN driver_standings ds ON r.race_id = ds.race_id
            WHERE ds.race_id IS NULL
        """))
        missing_ids = [row[0] for row in missing_standings]

        # Output
        print(f"Point Reconciliation Failures (Drift > 0.1): {len(drifts)}")
        if drifts:
            print("Sample Drifts (Calculated vs Official):")
            print(json.dumps(drifts[:5], indent=2))
            
        print(f"\nRaces with Results but ZERO Standings records: {len(missing_ids)}")
        if missing_ids:
            print(f"Sample Race IDs: {missing_ids[:10]}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_standings())
