import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def audit_results():
    print("--- APEX-F1 DETERMINISTIC AUDIT: RESULTS ---")
    engine = create_async_engine(DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.connect() as conn:
        # 1. Participation Density: How many results per race?
        res_density = await conn.execute(text("""
            SELECT race_id, count(*) as count 
            FROM results 
            GROUP BY race_id
        """))
        densities = [row[1] for row in res_density]
        
        avg_density = sum(densities) / len(densities) if densities else 0
        min_density = min(densities) if densities else 0
        max_density = max(densities) if densities else 0

        # 2. Position Integrity: Detect races with duplicate positions
        pos_dupes = await conn.execute(text("""
            SELECT race_id, position, count(*) 
            FROM results 
            WHERE position IS NOT NULL
            GROUP BY race_id, position
            HAVING count(*) > 1
        """))
        dupe_list = [{"race_id": row[0], "position": row[1], "count": row[2]} for row in pos_dupes]

        # 3. DNS/DNF Ratio
        status_audit = await conn.execute(text("""
            SELECT status, count(*) 
            FROM results 
            GROUP BY status 
            ORDER BY count(*) DESC 
            LIMIT 10
        """))
        statuses = {row[0]: row[1] for row in status_audit}

        # 4. Points Audit: Check for null points
        null_points = await conn.execute(text("SELECT count(*) FROM results WHERE points IS NULL"))
        null_pts_count = null_points.scalar()

        # Output
        print(f"Average Results per Race: {avg_density:.2f} (Min: {min_density}, Max: {max_density})")
        print(f"Races with Duplicate Positions: {len(dupe_list)}")
        if dupe_list:
            print(f"Sample Duplicates: {dupe_list[:3]}")
        
        print(f"\nStatus Distribution (Top 10):")
        for s, c in statuses.items():
            print(f" - {s}: {c}")
            
        print(f"\nConsistency Checks:")
        print(f" - Results with Null Points: {null_pts_count}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_results())
