import asyncio
from sqlalchemy import select, func
from apps.api.db import engine
from apps.api.models import DriverStanding, ConstructorStanding

async def check():
    async with engine.connect() as conn:
        # Get latest race_id
        latest_race_id = await conn.scalar(select(func.max(DriverStanding.race_id)))
        
        # Drivers in latest standings
        d_count = await conn.scalar(
            select(func.count(DriverStanding.driver_id.distinct()))
            .where(DriverStanding.race_id == latest_race_id)
        )
        
        # Teams in latest standings
        c_count = await conn.scalar(
            select(func.count(ConstructorStanding.constructor_id.distinct()))
            .where(ConstructorStanding.race_id == latest_race_id)
        )
        
        print(f"Drivers: {d_count}")
        print(f"Teams: {c_count}")

if __name__ == "__main__":
    asyncio.run(check())
