import asyncio
import os
from db import engine
from models import Base

async def fix_schema():
    print("Connecting to database to update schema...")
    try:
        async with engine.begin() as conn:
            # This will create all missing tables (like platform_health)
            # without deleting any of your F1 data.
            await conn.run_sync(Base.metadata.create_all)
            print("Success: Database schema updated and missing tables created!")
    except Exception as e:
        print(f"Error updating schema: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_schema())
