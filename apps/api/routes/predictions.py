from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from apps.api.db import get_db
from apps.api.models import PredictedRaceResult, PredictedDriverStanding, PredictedConstructorStanding, PredictionRun, Driver
from apps.api.schemas import PredictedRaceResultResponse, PredictedDriverStandingResponse
from typing import List
import redis.asyncio as redis
import json

router = APIRouter(prefix="/predictions", tags=["AI Predictions"])

@router.get("/race/{race_id}", response_model=List[PredictedRaceResultResponse])
async def get_race_predictions(race_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch AI predicted results for a specific race."""
    # For the demo, we return the latest simulation run
    latest_run = await db.scalar(select(PredictionRun.id).order_by(PredictionRun.timestamp.desc()).limit(1))
    if not latest_run:
        raise HTTPException(status_code=404, detail="No predictions found")
        
    stmt = select(PredictedRaceResult).where(PredictedRaceResult.run_id == latest_run, PredictedRaceResult.race_id == race_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/standings/drivers", response_model=List[PredictedDriverStandingResponse])
async def get_predicted_driver_standings(db: AsyncSession = Depends(get_db)):
    """Fetch AI forecasted end-of-season driver standings."""
    latest_run = await db.scalar(select(PredictionRun.id).order_by(PredictionRun.timestamp.desc()).limit(1))
    if not latest_run:
        raise HTTPException(status_code=404, detail="No predictions found")
        
    stmt = select(PredictedDriverStanding).where(PredictedDriverStanding.run_id == latest_run).order_by(PredictedDriverStanding.predicted_position)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/trigger", status_code=202)
async def trigger_prediction_run(db: AsyncSession = Depends(get_db)):
    """Manually trigger a new AI simulation run."""
    from apps.api.ml.engine import F1Predictor
    predictor = F1Predictor()
    run_id = await predictor.run_simulation(db, 2026)
    return {"message": "Simulation started", "run_id": run_id}
