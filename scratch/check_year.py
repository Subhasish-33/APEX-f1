import asyncio
from sqlalchemy import select, func
from apps.api.db import engine
from apps.api.models import Race

async def check():
    async with engine.connect() as conn:
        res = await conn.scalar(select(func.max(Race.year)))
        print(f"Max Year in DB: {res}")

if __name__ == "__main__":
    asyncio.run(check())
