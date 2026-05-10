import asyncio
import logging
import httpx
from datetime import datetime
from sqlalchemy import select, insert, delete
from sqlalchemy.ext.asyncio import AsyncSession
from db import engine
from models import Race, Result, Telemetry, RaceMoment, Driver

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fetch_lap_times(year: int, round: int):
    url = f"https://api.jolpi.ca/ergast/f1/{year}/{round}/laps.json?limit=2000"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url)
        data = r.json()
        return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])[0].get("Laps", [])

async def ingest_race_intelligence(race_id: int):
    # 1. Resolve year and round
    async with AsyncSession(engine) as s:
        race = await s.get(Race, race_id)
        if not race: return
        year, rnd = race.year, race.round

    logger.info(f"Ingesting intelligence for {race.name} ({year} R{rnd})...")
    
    # 2. Fetch Lap Times
    laps = await fetch_lap_times(year, rnd)
    if not laps:
        logger.warning(f"No lap times found for {race.name}")
        return

    # 3. Populate Telemetry & Identify Moments
    async with AsyncSession(engine) as s:
        # Clear existing telemetry for this race
        await s.execute(delete(Telemetry).where(Telemetry.race_id == race_id))
        await s.execute(delete(RaceMoment).where(RaceMoment.race_id == race_id))
        
        driver_map = {} # driver_ref -> driver_id
        drivers = await s.execute(select(Driver))
        for d in drivers.scalars():
            driver_map[d.driver_ref] = d.driver_id

        # Position tracking for overtakes
        prev_positions = {} # driver_id -> pos

        for lap_data in laps:
            lap_num = int(lap_data.get("number"))
            timings = lap_data.get("Timings", [])
            
            for t in timings:
                d_ref = t.get("driverId")
                d_id = driver_map.get(d_ref)
                if not d_id: continue
                
                pos = int(t.get("position"))
                time_str = t.get("time") # "1:34.567"
                
                # Parse time to float
                try:
                    m, rest = time_str.split(":")
                    s_val, ms = rest.split(".")
                    lap_time_ms = int(m)*60*1000 + int(s_val)*1000 + int(ms)
                except:
                    lap_time_ms = 0

                # 3a. Save Telemetry
                s.add(Telemetry(
                    race_id=race_id,
                    driver_id=d_id,
                    lap_number=lap_num,
                    lap_time=lap_time_ms / 1000.0
                ))

                # 3b. Identify Overtakes
                if d_id in prev_positions:
                    prev_pos = prev_positions[d_id]
                    if pos < prev_pos:
                        gained = prev_pos - pos
                        s.add(RaceMoment(
                            race_id=race_id,
                            lap=lap_num,
                            driver_id=d_id,
                            moment_type="OVERTAKE",
                            description=f"Overtook {gained} car(s)",
                            metadata_json={"gained": gained, "from": prev_pos, "to": pos}
                        ))
                
                prev_positions[d_id] = pos

            # Identify Safety Car (Pseudo-logic: if average lap time increases by 40%+)
            # In a real app, we'd use flags data.
        
        await s.commit()
    logger.info(f"Intelligence orchestration complete for {race.name}")

async def main():
    # Ingest for Bahrain 2024 (R1 -> 202401)
    await ingest_race_intelligence(202401)
    # Also Monza 2024 (R16 -> 202416)
    await ingest_race_intelligence(202416)

if __name__ == "__main__":
    asyncio.run(main())
