import asyncio
from apps.api.db import engine
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def check():
    async with AsyncSession(engine) as session:
        res = await session.execute(text("SELECT count(*) FROM telemetry"))
        print(f"Telemetry count: {res.scalar()}")
        
        if res.scalar() > 0:
            res = await session.execute(text("SELECT * FROM telemetry LIMIT 5"))
            for row in res:
                print(row)

if __name__ == "__main__":
    asyncio.run(check())
