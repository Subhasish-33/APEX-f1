import asyncio
from apps.api.db import engine
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def check():
    async with AsyncSession(engine) as session:
        res = await session.execute(text("SELECT count(*) FROM races WHERE year = 2025"))
        print(f"2025 races: {res.scalar()}")
        
        res = await session.execute(text("SELECT name, fp1_date, date FROM races WHERE year = 2025 LIMIT 5"))
        for row in res:
            print(row)

if __name__ == "__main__":
    asyncio.run(check())
