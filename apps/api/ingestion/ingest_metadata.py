import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert

from core import fetch_all, logger, engine
from models import Driver, Constructor

async def ingest_drivers():
    logger.info("PHASE 2: Synchronizing Drivers (Metadata)...")
    items = await fetch_all("drivers.json", ["DriverTable", "Drivers"])
    async with AsyncSession(engine) as s:
        for d in items:
            stmt = insert(Driver).values(
                driver_ref=d.get("driverId"),
                code=d.get("code"),
                forename=d.get("givenName"),
                surname=d.get("familyName"),
                nationality=d.get("nationality")
            )
            await s.execute(stmt.on_conflict_do_update(
                index_elements=["driver_ref"],
                set_={
                    "code": stmt.excluded.code,
                    "forename": stmt.excluded.forename,
                    "surname": stmt.excluded.surname,
                    "nationality": stmt.excluded.nationality
                }
            ))
        await s.commit()

async def ingest_constructors():
    logger.info("PHASE 2: Synchronizing Constructors (Metadata)...")
    items = await fetch_all("constructors.json", ["ConstructorTable", "Constructors"])
    async with AsyncSession(engine) as s:
        for c in items:
            stmt = insert(Constructor).values(
                constructor_ref=c.get("constructorId"),
                name=c.get("name"),
                nationality=c.get("nationality")
            )
            await s.execute(stmt.on_conflict_do_update(
                index_elements=["constructor_ref"],
                set_={
                    "name": stmt.excluded.name,
                    "nationality": stmt.excluded.nationality
                }
            ))
        await s.commit()

async def main():
    await ingest_drivers()
    await ingest_constructors()
    print("🏁 Metadata entities synchronized.")

if __name__ == "__main__":
    asyncio.run(main())
