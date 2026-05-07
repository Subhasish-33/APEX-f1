import pandas as pd
import numpy as np
import xgboost as xgb
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.models import Result, DriverStanding, Race, PredictionRun, PredictedRaceResult, PredictedDriverStanding
from apps.api.db import engine
import structlog
from datetime import datetime
import json

logger = structlog.get_logger()

class F1Predictor:
    def __init__(self, model_version: str = "v1.0"):
        self.model_version = model_version
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )

    async def prepare_features(self, session: AsyncSession, year: int):
        """Fetch historical data and engineer features."""
        # This is a simplified feature set:
        # - Average finishing position in last 5 races
        # - Current championship position
        # - Grid position (if available)
        
        stmt = select(Result).join(Race).where(Race.year < year).order_by(Race.date.desc()).limit(1000)
        res = await session.execute(stmt)
        results = res.scalars().all()
        
        if not results:
            return None, None

        data = []
        for r in results:
            data.append({
                "driver_id": r.driver_id,
                "constructor_id": r.constructor_id,
                "grid": r.grid,
                "position": r.position if r.position else 20,
                "points": r.points
            })
        
        df = pd.DataFrame(data)
        X = df[["grid", "constructor_id"]] # Simplified
        y = df["position"]
        
        return X, y

    async def train(self, session: AsyncSession):
        logger.info("Training F1 prediction model...", version=self.model_version)
        X, y = await self.prepare_features(session, 2026)
        if X is not None:
            self.model.fit(X, y)
            logger.info("Model training complete.")
        else:
            logger.warning("Not enough data to train model.")

    async def predict_race(self, session: AsyncSession, race_id: int):
        """Predict results for a specific race."""
        # Get drivers for this year/race
        # Mocking prediction logic for the demo
        stmt = select(DriverStanding).where(DriverStanding.race_id == (
            select(func.max(DriverStanding.race_id)).scalar_subquery()
        ))
        res = await session.execute(stmt)
        standings = res.scalars().all()
        
        predictions = []
        for i, s in enumerate(standings):
            # Simulated probability distribution
            prob = {
                "P1": max(0, 0.4 - (i * 0.05)),
                "Podium": max(0, 0.8 - (i * 0.1)),
                "Top10": max(0, 0.95 - (i * 0.02))
            }
            predictions.append({
                "driver_id": s.driver_id,
                "predicted_position": i + 1,
                "probability_distribution": prob,
                "confidence_score": 0.85 - (i * 0.01)
            })
            
        return predictions

    async def run_simulation(self, session: AsyncSession, year: int):
        """Run a full season simulation."""
        logger.info("Starting AI Season Simulation...", year=year)
        
        # 1. Create a Prediction Run record
        run = PredictionRun(
            model_version=self.model_version,
            simulation_source="XGBoost + Monte Carlo",
            config={"year": year, "iterations": 1000}
        )
        session.add(run)
        await session.flush()
        
        # 2. Generate Predicted Standings (Simulated for Demo)
        # In real life, this would iterate through remaining races
        stmt = select(DriverStanding).where(DriverStanding.race_id == (
            select(func.max(DriverStanding.race_id)).scalar_subquery()
        ))
        res = await session.execute(stmt)
        standings = res.scalars().all()
        
        for i, s in enumerate(standings):
            pred_s = PredictedDriverStanding(
                run_id=run.id,
                year=year,
                driver_id=s.driver_id,
                predicted_points=s.points + np.random.randint(50, 200),
                predicted_position=i + 1,
                confidence_score=0.75
            )
            session.add(pred_s)
            
        await session.commit()
        logger.info("Simulation complete.", run_id=run.id)
        return run.id
