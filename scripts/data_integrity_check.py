import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Add api directory to path
sys.path.append(os.path.join(os.getcwd(), "apps/api"))
from db import engine

async def check_integrity():
    print("🚀 Starting Data Integrity Audit...")
    issues = []
    
    async with AsyncSession(engine) as session:
        # 1. Check for Results with missing Drivers
        res = await session.execute(text("""
            SELECT count(*) FROM results r 
            LEFT JOIN drivers d ON r.driver_id = d.driver_id 
            WHERE d.driver_id IS NULL
        """))
        orphan_results = res.scalar()
        if orphan_results > 0:
            issues.append(f"❌ Found {orphan_results} results with missing driver references.")

        # 2. Check for Results with missing Races
        res = await session.execute(text("""
            SELECT count(*) FROM results r 
            LEFT JOIN races ra ON r.race_id = ra.race_id 
            WHERE ra.race_id IS NULL
        """))
        orphan_races = res.scalar()
        if orphan_races > 0:
            issues.append(f"❌ Found {orphan_races} results with missing race references.")

        # 3. Check for duplicate standings (Race + Driver)
        res = await session.execute(text("""
            SELECT race_id, driver_id, count(*) FROM driver_standings 
            GROUP BY race_id, driver_id HAVING count(*) > 1
        """))
        dupes = res.fetchall()
        if dupes:
            issues.append(f"❌ Found {len(dupes)} duplicate driver standing entries.")

        # 4. Check for Races with missing Circuits
        res = await session.execute(text("""
            SELECT count(*) FROM races r 
            LEFT JOIN circuits c ON r.circuit_id = c.circuit_id 
            WHERE c.circuit_id IS NULL
        """))
        orphan_circuits = res.scalar()
        if orphan_circuits > 0:
            issues.append(f"❌ Found {orphan_circuits} races with missing circuit references.")

    if issues:
        print("\n".join(issues))
        sys.exit(1)
    else:
        print("✅ Data integrity audit passed. No orphan or duplicate records found.")

if __name__ == "__main__":
    asyncio.run(check_integrity())
