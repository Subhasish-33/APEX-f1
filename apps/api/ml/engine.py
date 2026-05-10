import pandas as pd
import numpy as np
import xgboost as xgb
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from models import Result, DriverStanding, Race, PredictionRun, PredictedRaceResult, PredictedDriverStanding
from db import engine
import structlog
from datetime import datetime
import json

logger = structlog.get_logger()

import structlog
from ml.registry import ModelRegistry
from ml.calibration import ProbabilityLayer
from ml.simulation import MonteCarloSimulator

logger = structlog.get_logger()

class InferenceEngine:
    """
    Central Nervous System for Predictive Intelligence.
    Combines the raw model, calibration, simulation, and explainability.
    """
    def __init__(self):
        self.registry = ModelRegistry()
        self.probability_layer = ProbabilityLayer()
        self.simulator = MonteCarloSimulator(iterations=1000)
        self.explainer = None
        self.is_ready = False
        
    def initialize(self) -> bool:
        """Called at startup to load all artifacts."""
        success = self.registry.load_active_model()
        if not success:
            logger.warning("InferenceEngine failed to initialize model. ML Fallback required.")
            return False
            
        # Note: ProbabilityLayer should load a fitted calibration.pkl in production.
        # For V1, we simulate an Isotonic un-fitted state or load dummies.
        
        self.is_ready = True
        logger.info("InferenceEngine Initialized successfully.", metadata=self.registry.get_metadata())
        return True
        
    def predict(self, feature_df, simulation_count: int = 0):
        """Runs the prediction pipeline."""
        if not self.is_ready or self.registry.get_model() is None:
            raise RuntimeError("InferenceEngine is not ready.")
            
        model = self.registry.get_model()
        metadata = self.registry.get_metadata()
        
        # 1. Raw Prediction
        # Ensure features match what model was trained on
        X = feature_df[metadata["feature_columns"]].astype(float)
        scores = model.predict(X)
        
        # Add to df
        feature_df["xgb_score"] = scores
        
        # Sort by score descending (Ranker logic)
        sorted_df = feature_df.sort_values(by="xgb_score", ascending=False).reset_index(drop=True)
        sorted_df["predicted_position"] = sorted_df.index + 1
        
        # 2. Probability Calibration (Simulated if not fitted)
        # 3. Explainability
        # 4. Simulation
        
        return sorted_df
