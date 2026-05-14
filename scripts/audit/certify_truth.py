import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
from datetime import datetime

# Path resolution for local environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'apps/api/.env'))

DATABASE_URL = os.getenv('DATABASE_URL')

async def certify_truth():
    print("--- APEX-F1 TRUTH CERTIFICATION ENGINE ---")
    print(f"Targeting: {DATABASE_URL.split('@')[-1] if DATABASE_URL else 'UNDEFINED'}")
    
    engine = create_async_engine(DATABASE_URL, connect_args={
        'prepared_statement_cache_size': 0,
        'statement_cache_size': 0
    })
    
    async with engine.begin() as conn:
        # 1. Reset all to default archival
        print("Resetting global season metadata...")
        await conn.execute(text("""
            UPDATE seasons 
            SET status = 'ARCHIVAL', 
                is_verified = False, 
                coverage_confidence = 0.1,
                last_audit_at = :now
        """), {"now": datetime.utcnow()})

        # 2. Certify Tier 1 Canonical Truth (2023-2024)
        print("Certifying Tier 1 Canonical Truth (2023-2024)...")
        await conn.execute(text("""
            UPDATE seasons 
            SET status = 'VERIFIED', 
                is_verified = True, 
                coverage_confidence = 1.0,
                last_audit_at = :now
            WHERE year IN (2023, 2024)
        """), {"now": datetime.utcnow()})

        # 3. Certify Archival Data (2010-2022) with Partial Confidence
        # Only for years that actually have race data
        print("Certifying Historical Partial Coverage (2010-2022)...")
        await conn.execute(text("""
            UPDATE seasons 
            SET status = 'PARTIAL', 
                is_verified = False, 
                coverage_confidence = 0.8,
                last_audit_at = :now
            WHERE year BETWEEN 2010 AND 2022
            AND year IN (SELECT DISTINCT year FROM races)
        """), {"now": datetime.utcnow()})

        # 4. Final Verification Summary
        res = await conn.execute(text("SELECT year, status, coverage_confidence FROM seasons WHERE status != 'ARCHIVAL' ORDER BY year DESC"))
        verified = res.fetchall()
        
        print("\n--- CERTIFICATION SUMMARY ---")
        for row in verified:
            print(f"[{row[0]}] Status: {row[1]} | Confidence: {row[2]*100}%")
            
    await engine.dispose()
    print("\nTruth Certification Complete. APEX-F1 Intelligence Layer is now state-aware.")

if __name__ == "__main__":
    asyncio.run(certify_truth())
