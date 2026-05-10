import httpx
import asyncio
import logging
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import text

from db import engine, init_db
from models import *

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

BASE_URL = "https://api.jolpi.ca/ergast/f1"
CURRENT_YEAR = datetime.now().year

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def fetch_one(endpoint: str, offset: int = 0, limit: int = 100):
    """Fetch a single page of data from API."""
    await asyncio.sleep(0.25)  # Rate limiting
    url = f"{BASE_URL}/{endpoint}"
    sep = "&" if "?" in endpoint else "?"
    url = f"{url}{sep}limit={limit}&offset={offset}"
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            return None

async def fetch_all(endpoint: str, data_key: list):
    """Fetch all pages of data from API."""
    offset = 0
    limit = 100
    all_items = []
    
    while True:
        data = await fetch_one(endpoint, offset, limit)
        if not data:
            break
            
        mr_data = data.get("MRData", {})
        
        # Traverse data_key to get the list of items
        items = mr_data
        for k in data_key:
            items = items.get(k, {})
        
        if not items or not isinstance(items, list):
            break
            
        all_items.extend(items)
        total = int(mr_data.get("total", 0))
        offset += limit
        
        if offset >= total:
            break
            
    return all_items

# -----------------------
# HELPERS
# -----------------------
async def get_driver_id(session, driver_ref):
    res = await session.execute(
        text("SELECT driver_id FROM drivers WHERE driver_ref = :ref"),
        {"ref": driver_ref}
    )
    row = res.fetchone()
    return row[0] if row else None

async def get_constructor_id(session, constructor_ref):
    res = await session.execute(
        text("SELECT constructor_id FROM constructors WHERE constructor_ref = :ref"),
        {"ref": constructor_ref}
    )
    row = res.fetchone()
    return row[0] if row else None

# -----------------------
# CORE TABLES
# -----------------------
async def ingest_seasons():
    logger.info("Ingesting seasons...")
    items = await fetch_all("seasons.json", ["SeasonTable", "Seasons"])
    # Ensure we include 2025 and 2026 even if not in Ergast yet
    extra_seasons = [{"season": str(y)} for y in range(2025, CURRENT_YEAR + 2)]
    items.extend(extra_seasons)
    
    async with AsyncSession(engine) as s:
        for d in items:
            stmt = insert(Season).values(year=int(d.get("season")))
            await s.execute(stmt.on_conflict_do_nothing())
        await s.commit()
    logger.info(f"Seasons complete. Total: {len(items)}")

async def ingest_drivers():
    logger.info("Ingesting drivers...")
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
                    "forename": stmt.excluded.forename,
                    "surname": stmt.excluded.surname,
                    "nationality": stmt.excluded.nationality,
                    "code": stmt.excluded.code
                }
            ))
        await s.commit()
    logger.info(f"Drivers complete. Total: {len(items)}")

async def ingest_constructors():
    logger.info("Ingesting constructors...")
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
    logger.info(f"Constructors complete. Total: {len(items)}")

async def ingest_circuits():
    logger.info("Ingesting circuits...")
    items = await fetch_all("circuits.json", ["CircuitTable", "Circuits"])
    async with AsyncSession(engine) as s:
        for c in items:
            stmt = insert(Circuit).values(
                circuit_id=c.get("circuitId"),
                name=c.get("circuitName"),
                location=c.get("Location", {}).get("locality"),
                country=c.get("Location", {}).get("country")
            )
            await s.execute(stmt.on_conflict_do_update(
                index_elements=["circuit_id"],
                set_={
                    "name": stmt.excluded.name,
                    "location": stmt.excluded.location,
                    "country": stmt.excluded.country
                }
            ))
        await s.commit()
    logger.info(f"Circuits complete. Total: {len(items)}")

async def ingest_races():
    def parse_dt(d_str, t_str):
        if not d_str: return None
        try:
            if t_str:
                # Ergast times are usually "15:00:00Z" or "15:00:00"
                t_str = t_str.replace("Z", "")
                return datetime.strptime(f"{d_str} {t_str}", "%Y-%m-%d %H:%M:%S")
            return datetime.strptime(d_str, "%Y-%m-%d")
        except:
            return None

    total_races = 0
    for year in range(2010, CURRENT_YEAR + 2):
        logger.info(f"Ingesting races for {year}...")
        items = await fetch_all(f"{year}.json", ["RaceTable", "Races"])
        if not items:
            logger.warning(f"No race data found for {year}")
            continue
            
        async with AsyncSession(engine) as s:
            for r in items:
                race_id = int(r.get("round")) + int(r.get("season")) * 100
                
                # Session parsing
                fp1 = r.get("FirstPractice", {})
                fp2 = r.get("SecondPractice", {})
                fp3 = r.get("ThirdPractice", {})
                qual = r.get("Qualifying", {})
                sprint = r.get("Sprint", {})

                stmt = insert(Race).values(
                    race_id=race_id,
                    year=int(r.get("season")),
                    round=int(r.get("round")),
                    circuit_id=r.get("Circuit", {}).get("circuitId"),
                    name=r.get("raceName"),
                    date=datetime.strptime(r.get("date"), "%Y-%m-%d").date(),
                    laps=int(r.get("laps", 0)) if r.get("laps") else None,
                    fp1_date=parse_dt(fp1.get("date"), fp1.get("time")),
                    fp2_date=parse_dt(fp2.get("date"), fp2.get("time")),
                    fp3_date=parse_dt(fp3.get("date"), fp3.get("time")),
                    qualifying_date=parse_dt(qual.get("date"), qual.get("time")),
                    sprint_date=parse_dt(sprint.get("date"), sprint.get("time")),
                )
                await s.execute(stmt.on_conflict_do_update(
                    index_elements=["race_id"],
                    set_={
                        "name": stmt.excluded.name,
                        "date": stmt.excluded.date,
                        "circuit_id": stmt.excluded.circuit_id,
                        "laps": stmt.excluded.laps,
                        "fp1_date": stmt.excluded.fp1_date,
                        "fp2_date": stmt.excluded.fp2_date,
                        "fp3_date": stmt.excluded.fp3_date,
                        "qualifying_date": stmt.excluded.qualifying_date,
                        "sprint_date": stmt.excluded.sprint_date,
                    }
                ))
                total_races += 1
            await s.commit()
    logger.info(f"Races complete. Total: {total_races}")

async def ingest_results():
    for year in range(2010, CURRENT_YEAR + 1):
        logger.info(f"Ingesting results for {year}...")
        items = await fetch_all(f"{year}/results.json", ["RaceTable", "Races"])
        if not items: continue
        
        async with AsyncSession(engine) as s:
            for r in items:
                race_id = int(r.get("round")) + int(r.get("season")) * 100
                for res in r.get("Results", []):
                    d_id = await get_driver_id(s, res.get("Driver", {}).get("driverId"))
                    c_id = await get_constructor_id(s, res.get("Constructor", {}).get("constructorId"))
                    if not d_id or not c_id: continue

                    stmt = insert(Result).values(
                        race_id=race_id,
                        driver_id=d_id,
                        constructor_id=c_id,
                        grid=int(res.get("grid", 0)),
                        position=int(res.get("position", 0)) if res.get("position", "").isdigit() else None,
                        points=float(res.get("points", 0)),
                        time=res.get("Time", {}).get("time"),
                        milliseconds=int(res.get("Time", {}).get("millis", 0)) if res.get("Time", {}).get("millis") else None,
                        fastest_lap=int(res.get("FastestLap", {}).get("lap", 0)) if res.get("FastestLap", {}).get("lap") else None,
                        fastest_lap_time=res.get("FastestLap", {}).get("Time", {}).get("time"),
                        status=res.get("status")
                    )
                    await s.execute(stmt.on_conflict_do_update(
                        constraint="uq_race_driver_result",
                        set_={
                            "grid": stmt.excluded.grid,
                            "position": stmt.excluded.position,
                            "points": stmt.excluded.points,
                            "constructor_id": stmt.excluded.constructor_id,
                            "time": stmt.excluded.time,
                            "milliseconds": stmt.excluded.milliseconds,
                            "fastest_lap": stmt.excluded.fastest_lap,
                            "fastest_lap_time": stmt.excluded.fastest_lap_time,
                            "status": stmt.excluded.status
                        }
                    ))
            await s.commit()

async def ingest_qualifying():
    for year in range(2010, CURRENT_YEAR + 1):
        logger.info(f"Ingesting qualifying for {year}...")
        items = await fetch_all(f"{year}/qualifying.json", ["RaceTable", "Races"])
        if not items: continue
        
        async with AsyncSession(engine) as s:
            for r in items:
                race_id = int(r.get("round")) + int(r.get("season")) * 100
                for q in r.get("QualifyingResults", []):
                    d_id = await get_driver_id(s, q.get("Driver", {}).get("driverId"))
                    c_id = await get_constructor_id(s, q.get("Constructor", {}).get("constructorId"))
                    if not d_id or not c_id: continue

                    stmt = insert(Qualifying).values(
                        race_id=race_id,
                        driver_id=d_id,
                        constructor_id=c_id,
                        position=int(q.get("position", 0)),
                        q1=q.get("Q1"),
                        q2=q.get("Q2"),
                        q3=q.get("Q3")
                    )
                    await s.execute(stmt.on_conflict_do_update(
                        constraint="uq_race_driver_qualifying",
                        set_={
                            "position": stmt.excluded.position,
                            "constructor_id": stmt.excluded.constructor_id,
                            "q1": stmt.excluded.q1,
                            "q2": stmt.excluded.q2,
                            "q3": stmt.excluded.q3
                        }
                    ))
            await s.commit()

async def ingest_driver_standings():
    for year in range(2010, CURRENT_YEAR + 1):
        logger.info(f"Ingesting driver standings for {year}...")
        items = await fetch_all(f"{year}/driverStandings.json", ["StandingsTable", "StandingsLists"])
        if not items: continue
        
        async with AsyncSession(engine) as s:
            for sl in items:
                race_id = int(sl.get("round")) + int(sl.get("season")) * 100
                for d in sl.get("DriverStandings", []):
                    d_id = await get_driver_id(s, d.get("Driver", {}).get("driverId"))
                    if not d_id: continue
                    stmt = insert(DriverStanding).values(
                        race_id=race_id,
                        driver_id=d_id,
                        points=float(d.get("points", 0)),
                        position=int(d.get("position", 0))
                    )
                    await s.execute(stmt.on_conflict_do_update(
                        constraint="uq_race_driver_standing",
                        set_={
                            "points": stmt.excluded.points,
                            "position": stmt.excluded.position
                        }
                    ))
            await s.commit()

async def ingest_constructor_standings():
    for year in range(2010, CURRENT_YEAR + 1):
        logger.info(f"Ingesting constructor standings for {year}...")
        items = await fetch_all(f"{year}/constructorStandings.json", ["StandingsTable", "StandingsLists"])
        if not items: continue
        
        async with AsyncSession(engine) as s:
            for sl in items:
                race_id = int(sl.get("round")) + int(sl.get("season")) * 100
                for c in sl.get("ConstructorStandings", []):
                    c_id = await get_constructor_id(s, c.get("Constructor", {}).get("constructorId"))
                    if not c_id: continue
                    stmt = insert(ConstructorStanding).values(
                        race_id=race_id,
                        constructor_id=c_id,
                        points=float(c.get("points", 0)),
                        position=int(c.get("position", 0))
                    )
                    await s.execute(stmt.on_conflict_do_update(
                        constraint="uq_race_constructor_standing",
                        set_={
                            "points": stmt.excluded.points,
                            "position": stmt.excluded.position
                        }
                    ))
            await s.commit()

async def ingest_telemetry_mock():
    """Placeholder for FastF1/OpenF1 telemetry ingestion logic."""
    logger.info("Ingesting telemetry data (Simulated)...")
    # In a real scenario, this would use FastF1.get_session(year, race_name, 'R').laps
    # For now, we ensure the infrastructure is ready.
    pass

async def main():
    logger.info(f"🚀 Starting dynamic ingestion pipeline (2010-{CURRENT_YEAR+1})...")
    await init_db()

    await ingest_seasons()
    await ingest_drivers()
    await ingest_constructors()
    await ingest_circuits()
    await ingest_races()
    await ingest_results()
    await ingest_qualifying()
    await ingest_driver_standings()
    await ingest_constructor_standings()
    await ingest_telemetry_mock()

    logger.info("✅ Hybrid ingestion complete!")

if __name__ == "__main__":
    asyncio.run(main())