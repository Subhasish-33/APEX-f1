import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Path resolution for local environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def audit_seasons():
    print("--- APEX-F1 DETERMINISTIC AUDIT: SEASONS ---")
    
    # Handle PgBouncer/Supabase connection constraints
    engine = create_async_engine(DATABASE_URL, connect_args={
        'prepared_statement_cache_size': 0,
        'statement_cache_size': 0
    })
    
    async with engine.connect() as conn:
        # 1. Total Season Count
        res = await conn.execute(text("SELECT year FROM seasons ORDER BY year DESC"))
        seasons = [row[0] for row in res]
        
        # 2. Race Counts per Season
        race_counts = await conn.execute(text("""
            SELECT year, COUNT(*) 
            FROM races 
            GROUP BY year 
            ORDER BY year DESC
        """))
        race_map = {row[0]: row[1] for row in race_counts}
        
        # 3. Validation Logic
        report = []
        for year in seasons:
            count = race_map.get(year, 0)
            status = "VALID" if count > 0 else "EMPTY_ENTITY"
            report.append({
                "season": year,
                "race_count": count,
                "status": status
            })
            
        # 4. Outliers & Anomalies
        orphaned_races = await conn.execute(text("""
            SELECT DISTINCT year FROM races 
            WHERE year NOT IN (SELECT year FROM seasons)
        """))
        orphans = [row[0] for row in orphaned_races]

        # Final Output
        print(f"Total Seasons Defined: {len(seasons)}")
        print(f"Seasons with 0 Races: {len([r for r in report if r['race_count'] == 0])}")
        print(f"Orphaned Season Years (in Races but not Seasons): {orphans}")
        print("\nDetail:")
        print(json.dumps(report, indent=2))
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_seasons())
