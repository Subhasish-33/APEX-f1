import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import datetime
import structlog
from models import Race, Result, Driver, Constructor, Qualifying, DriverStanding
from ml.regimes import get_regime_for_year, calculate_temporal_decay
from ml.validation import FeatureValidator

logger = structlog.get_logger()

class LeakageValidator:
    """Enforces strict temporal data boundaries."""
    @staticmethod
    def assert_pre_race(target_date: datetime, data_date: datetime, is_qualifying: bool = False):
        """Throws ValueError if data bleeds into the target race (unless it's qualifying data)."""
        if data_date > target_date:
            raise ValueError(f"CRITICAL LEAKAGE DETECTED: Data from {data_date} used to predict race on {target_date}")
        if data_date == target_date and not is_qualifying:
             raise ValueError(f"CRITICAL LEAKAGE DETECTED: Same-day data used. Ensure it is strictly pre-race.")

class LeakageAuditEngine:
    """Scans a generated DataFrame for hidden leakage before training."""
    
    @staticmethod
    def audit_dataframe(df: pd.DataFrame, target_col: str, ignore_cols: list = None):
        logger.info("Running LeakageAuditEngine on training data...")
        ignore_cols = ignore_cols or []
        ignore_cols.append(target_col)
        
        # 1. Target correlation check
        correlations = df.corr(numeric_only=True)[target_col].abs()
        suspicious_features = correlations[correlations > 0.95].index.tolist()
        
        # Remove known allowed columns from suspicious list
        suspicious_features = [f for f in suspicious_features if f not in ignore_cols]
        
        if suspicious_features:
            logger.error("SUSPICIOUS LEAKAGE DETECTED: Feature nearly perfectly correlates with target", features=suspicious_features)
            raise ValueError(f"Leakage detected: features {suspicious_features} have >0.95 correlation with target.")
            
        logger.info("LeakageAuditEngine passed. No obvious post-race aggregates found.")
        return True

class FeatureBuilder:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.validator = FeatureValidator()

    async def _get_race_context(self, race_id: int):
        race = await self.session.get(Race, race_id)
        if not race:
            raise ValueError(f"Race {race_id} not found.")
        return race

    async def build_driver_recent_form_5(self, driver_id: int, target_race: Race) -> float:
        """Average points scored in last 5 races for this driver."""
        stmt = select(Result.points, Race.date).join(Race).where(
            and_(
                Result.driver_id == driver_id,
                Race.date < target_race.date # Strict leakage firewall
            )
        ).order_by(Race.date.desc()).limit(5)
        
        res = await self.session.execute(stmt)
        points_history = [row.points for row in res.all()]
        
        if not points_history:
            return 0.0 # Cold start fallback
            
        return sum(points_history) / len(points_history)

    async def build_grid_position(self, driver_id: int, target_race_id: int) -> int:
        """Starting grid position - single strongest predictor, available pre-race."""
        stmt = select(Qualifying.position).where(
            and_(
                Qualifying.driver_id == driver_id,
                Qualifying.race_id == target_race_id
            )
        )
        res = await self.session.execute(stmt)
        pos = res.scalar()
        return pos if pos else 20 # Fallback if no qualifying data (start from back)

    async def build_driver_features(self, driver_id: int, target_race: Race) -> Dict[str, Any]:
        """Compile all driver-specific features."""
        # This is a stub for all complex features. 
        # In a full run, we would parallelize these async calls.
        grid_pos = await self.build_grid_position(driver_id, target_race.race_id)
        recent_form = await self.build_driver_recent_form_5(driver_id, target_race)
        
        # Mocks for advanced features not yet backed by full telemetry DB:
        # These will be replaced by actual telemetry-based aggregations later.
        aggression_rating = np.random.uniform(0.5, 0.9) 
        wet_weather_skill = np.random.uniform(0.6, 0.95)
        
        return {
            "driver_recent_form_5": recent_form,
            "grid_position": grid_pos,
            "aggression_rating": aggression_rating,
            "wet_weather_skill": wet_weather_skill,
            # ... other driver features
        }

    async def build_full_feature_vector(self, race_id: int, driver_id: int) -> Optional[Dict[str, Any]]:
        """Constructs the complete feature vector for a specific driver in a specific race."""
        try:
            target_race = await self._get_race_context(race_id)
            
            # Regime feature
            regime = get_regime_for_year(target_race.year)
            
            driver_features = await self.build_driver_features(driver_id, target_race)
            
            # Combine all
            vector = {
                "race_id": race_id,
                "driver_id": driver_id,
                "regime_id": regime,
                **driver_features
            }
            
            # Validate
            is_valid, reason = self.validator.validate_row(vector)
            if not is_valid:
                logger.warning("Feature vector validation failed", race_id=race_id, driver_id=driver_id, reason=reason)
                return None
                
            return vector
            
        except Exception as e:
            logger.error("Failed to build feature vector", error=str(e), race_id=race_id, driver_id=driver_id)
            return None
