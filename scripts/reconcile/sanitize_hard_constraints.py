import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def sanitize_and_harden():
    print("--- APEX-F1 SCHEMA HARDENING & SANITIZATION ---")
    engine = create_async_engine(DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.begin() as conn:
        # 1. Sanitize Results: Remove duplicate positions within the same race
        print("Sanitizing duplicate positions in results...")
        await conn.execute(text("""
            DELETE FROM results 
            WHERE result_id IN (
                SELECT result_id FROM (
                    SELECT result_id, ROW_NUMBER() OVER(PARTITION BY race_id, position ORDER BY result_id DESC) as rn
                    FROM results
                    WHERE position IS NOT NULL
                ) t WHERE t.rn > 1
            )
        """))

        # 2. Sanitize Races: Remove duplicate rounds within the same year
        print("Sanitizing duplicate rounds in races...")
        await conn.execute(text("""
            DELETE FROM races 
            WHERE race_id IN (
                SELECT race_id FROM (
                    SELECT race_id, ROW_NUMBER() OVER(PARTITION BY year, round ORDER BY race_id DESC) as rn
                    FROM races
                ) t WHERE t.rn > 1
            )
        """))

        # 3. Apply Hard Constraints
        print("Applying Unique Constraints to DB...")
        
        # Result position constraint
        try:
            await conn.execute(text("ALTER TABLE results ADD CONSTRAINT uq_race_position_result UNIQUE (race_id, position)"))
            print(" - Added UNIQUE(race_id, position) to results")
        except Exception as e:
            print(f" - Skip/Fail results uq: {e}")

        # Race round constraint
        try:
            await conn.execute(text("ALTER TABLE races ADD CONSTRAINT uq_race_year_round UNIQUE (year, round)"))
            print(" - Added UNIQUE(year, round) to races")
        except Exception as e:
            print(f" - Skip/Fail races uq: {e}")

    await engine.dispose()
    print("--- SANITIZATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(sanitize_and_harden())
