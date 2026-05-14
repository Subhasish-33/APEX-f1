import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def audit_races():
    print("--- APEX-F1 DETERMINISTIC AUDIT: RACES ---")
    engine = create_async_engine(DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.connect() as conn:
        # 1. Sequence Audit: Look for gaps in rounds per season
        res = await conn.execute(text("""
            SELECT year, round, name 
            FROM races 
            ORDER BY year DESC, round ASC
        """))
        
        seasons_data = {}
        for row in res:
            y, r, n = row
            if y not in seasons_data:
                seasons_data[y] = []
            seasons_data[y].append(r)
            
        gaps = []
        for year, rounds in seasons_data.items():
            if not rounds: continue
            max_round = max(rounds)
            expected = set(range(1, max_round + 1))
            actual = set(rounds)
            missing = expected - actual
            if missing:
                gaps.append({
                    "season": year,
                    "missing_rounds": list(missing),
                    "total_found": len(rounds),
                    "max_round_found": max_round
                })

        # 2. Metadata Audit: Null fields in critical columns
        null_metadata = await conn.execute(text("""
            SELECT 
                COUNT(*) FILTER (WHERE circuit_id IS NULL) as missing_circuit,
                COUNT(*) FILTER (WHERE date IS NULL) as missing_date,
                COUNT(*) FILTER (WHERE laps IS NULL) as missing_laps
            FROM races
        """))
        meta_stats = null_metadata.fetchone()

        # 3. Future Year Check
        future_races = await conn.execute(text("SELECT count(*) FROM races WHERE year > 2024"))
        future_count = future_races.scalar()

        # Output
        print(f"Seasons with Round Gaps: {len(gaps)}")
        if gaps:
            print(json.dumps(gaps[:5], indent=2)) # Show first 5
        
        print(f"\nMetadata Integrity:")
        print(f" - Missing Circuits: {meta_stats[0]}")
        print(f" - Missing Dates: {meta_stats[1]}")
        print(f" - Missing Lap Counts: {meta_stats[2]}")
        print(f" - Future Season Races (>2024): {future_count}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_races())
