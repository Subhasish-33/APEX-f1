import asyncio
from apps.api.db import engine
from sqlalchemy import text

async def check():
    async with engine.connect() as conn:
        drivers = (await conn.execute(text("SELECT count(*) FROM drivers"))).scalar()
        constructors = (await conn.execute(text("SELECT count(*) FROM constructors"))).scalar()
        races = (await conn.execute(text("SELECT count(*) FROM races"))).scalar()
        results = (await conn.execute(text("SELECT count(*) FROM results"))).scalar()
        pit_stops = (await conn.execute(text("SELECT count(*) FROM pit_stops"))).scalar()
        driver_standings = (await conn.execute(text("SELECT count(*) FROM driver_standings"))).scalar()
        constructor_standings = (await conn.execute(text("SELECT count(*) FROM constructor_standings"))).scalar()
        qualifying = (await conn.execute(text("SELECT count(*) FROM qualifying"))).scalar()
        
        print(f"Drivers: {drivers}")
        print(f"Constructors: {constructors}")
        print(f"Races: {races}")
        print(f"Results: {results}")
        print(f"Pit Stops: {pit_stops}")
        print(f"Driver Standings: {driver_standings}")
        print(f"Constructor Standings: {constructor_standings}")
        print(f"Qualifying: {qualifying}")

if __name__ == "__main__":
    asyncio.run(check())
