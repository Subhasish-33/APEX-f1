import asyncio
from sqlalchemy import select
from apps.api.db import engine
from apps.api.models import DriverStanding, Driver

async def check():
    async with engine.connect() as conn:
        # Get latest race_id
        latest_race_id = await conn.scalar(select(DriverStanding.race_id).order_by(DriverStanding.race_id.desc()).limit(1))
        stmt = select(Driver.driver_ref).join(DriverStanding).where(DriverStanding.race_id == latest_race_id)
        res = await conn.execute(stmt)
        print([r[0] for r in res.all()])

if __name__ == "__main__":
    asyncio.run(check())
