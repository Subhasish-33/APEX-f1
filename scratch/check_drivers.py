import asyncio
from db import engine
from sqlalchemy import text

async def check_drivers():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT driver_ref FROM drivers LIMIT 10"))
        for row in res:
            print(row[0])

if __name__ == "__main__":
    asyncio.run(check_drivers())
