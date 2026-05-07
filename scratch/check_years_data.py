import asyncio
from sqlalchemy import select, func
from apps.api.db import engine
from apps.api.models import Race, Result

async def check():
    async with engine.connect() as conn:
        for y in [2023, 2024, 2025, 2026]:
            res = await conn.scalar(select(func.count(Result.result_id)).join(Race).where(Race.year == y))
            print(f"Results for {y}: {res}")

if __name__ == "__main__":
    asyncio.run(check())
