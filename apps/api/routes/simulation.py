import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.db import get_db
from apps.api.models import LapTime, Driver
from typing import List, Dict, Any
import redis.asyncio as redis
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/races", tags=["Live Simulation"])

@router.get("/{race_id}/simulation")
async def get_race_simulation(race_id: int, db: AsyncSession = Depends(get_db)):
    """Returns pre-processed lap-by-lap position data for the cinematic replay."""
    
    # Try cache first
    try:
        redis_client = redis.Redis(host='localhost', port=6379, db=0)
        cached = await redis_client.get(f"simulation:{race_id}")
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.warning("Redis unavailable for simulation cache.", error=str(e))
        
    # Fetch LapTimes
    stmt = select(LapTime.lap, LapTime.position, LapTime.time, Driver.driver_ref, Driver.code)\
           .join(Driver, LapTime.driver_id == Driver.driver_id)\
           .where(LapTime.race_id == race_id)\
           .order_by(LapTime.lap, LapTime.position)
           
    res = await db.execute(stmt)
    rows = res.all()
    
    if not rows:
        raise HTTPException(status_code=404, detail="No simulation data available for this race.")
        
    # Group by lap
    simulation_data = []
    laps = {}
    
    for row in rows:
        lap = row.lap
        if lap not in laps:
            laps[lap] = []
            
        laps[lap].append({
            "position": row.position,
            "driver_ref": row.driver_ref,
            "code": row.code or row.driver_ref[:3].upper(),
            "time": row.time
        })
        
    for lap_num in sorted(laps.keys()):
        simulation_data.append({
            "lap": lap_num,
            "positions": laps[lap_num]
        })
        
    # Cache result
    try:
        await redis_client.setex(f"simulation:{race_id}", 86400, json.dumps(simulation_data))
    except:
        pass
        
    return simulation_data
