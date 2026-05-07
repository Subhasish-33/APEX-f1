import asyncio
from sqlalchemy import select, func
from apps.api.db import engine
from apps.api.models import Race, Result, Driver, Constructor

async def check():
    async with engine.connect() as conn:
        r_count = await conn.scalar(select(func.count(Race.race_id)))
        res_count = await conn.scalar(select(func.count(Result.result_id)))
        d_count = await conn.scalar(select(func.count(Driver.driver_id)))
        c_count = await conn.scalar(select(func.count(Constructor.constructor_id)))
        print(f"Races: {r_count}")
        print(f"Results: {res_count}")
        print(f"Drivers: {d_count}")
        print(f"Constructors: {c_count}")

if __name__ == "__main__":
    asyncio.run(check())
