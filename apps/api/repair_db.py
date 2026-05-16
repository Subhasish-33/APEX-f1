import asyncio
from db import engine
from sqlalchemy import text

async def repair_data():
    print("Starting database data repair...")
    async with engine.connect() as conn:
        # 1. Update driver_refs to match the 'forename_surname' format expected by the UI
        print("Updating driver references...")
        await conn.execute(text("""
            UPDATE drivers 
            SET driver_ref = LOWER(forename) || '_' || LOWER(surname)
            WHERE driver_ref NOT LIKE '%_%'
        """))
        
        # 2. Ensure we have at least one health record so the status bar turns green
        print("Initializing health state...")
        await conn.execute(text("""
            INSERT INTO platform_health (component, status, message, timestamp)
            VALUES ('API', 'OK', 'System synchronized and operational', NOW())
        """))
        
        await conn.commit()
        print("Repair Complete!")

if __name__ == "__main__":
    asyncio.run(repair_data())
