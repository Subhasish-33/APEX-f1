from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Dict
from dependencies import get_db
from analytics.intelligence_engine import PsychologicalEngine
from models import Driver
from sqlalchemy import select
from pydantic import BaseModel

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

class BattleWarfareResponse(BaseModel):
    driver1_id: int
    driver2_id: int
    breaking_points: Dict[int, Dict]
    edge: Dict
    rivalry_intensity: float

@router.get("/analytics/compare/warfare", response_model=BattleWarfareResponse)
async def get_battle_warfare(
    driver1_id: int, 
    driver2_id: int, 
    year: int,
    circuit_id: str,
    session: DBSession
):
    engine = PsychologicalEngine(session)
    
    bp1 = await engine.calculate_breaking_point(driver1_id, year)
    bp2 = await engine.calculate_breaking_point(driver2_id, year)
    edge = await engine.get_circuit_weighted_edge(driver1_id, driver2_id, circuit_id)
    
    # Get rivalry intensity if exists
    rivalries = await engine.detect_rivalries(year)
    intensity = 0
    for r in rivalries:
        if set(r['driver_ids']) == {driver1_id, driver2_id}:
            intensity = r['intensity']
            break

    return {
        "driver1_id": driver1_id,
        "driver2_id": driver2_id,
        "breaking_points": {driver1_id: bp1, driver2_id: bp2},
        "edge": edge,
        "rivalry_intensity": intensity
    }

@router.get("/analytics/compare/simulate")
async def simulate_duel(
    driver1_id: int,
    driver2_id: int,
    session: DBSession,
    scenario: str = "dry", # dry, wet, night, chaos
):
    # Simulated stochastic logic
    import random
    base_prob = 50
    if scenario == "wet":
        base_prob += random.randint(-10, 10) # Drivers have different wet skills
    
    return {
        "winner_id": driver1_id if base_prob > 50 else driver2_id,
        "probability": base_prob if base_prob > 50 else 100 - base_prob,
        "scenario_impact": scenario.upper()
    }
