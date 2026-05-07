import asyncio
from sqlalchemy import text
from apps.api.db import engine

async def update_db():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE driver_standings ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0"))
        await conn.execute(text("ALTER TABLE constructor_standings ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0"))
        print("✅ Database columns added.")

if __name__ == "__main__":
    asyncio.run(update_db())
