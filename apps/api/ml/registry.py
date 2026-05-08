import joblib
import json
import os
import structlog

logger = structlog.get_logger()

class ModelRegistry:
    """Handles active model selection, version tracking, and calibration artifacts."""
    
    def __init__(self, models_dir: str = "apps/api/ml"):
        self.models_dir = models_dir
        self.active_model = None
        self.metadata = None
        
    def load_active_model(self, version: str = "v1.0"):
        logger.info(f"Loading ModelRegistry artifacts for version {version}...")
        
        model_path = os.path.join(self.models_dir, "model.pkl")
        if not os.path.exists(model_path):
            logger.error(f"Active model artifact missing at {model_path}")
            return False
            
        try:
            artifact = joblib.load(model_path)
            self.active_model = artifact.get("model")
            self.metadata = {
                "version": artifact.get("model_version", version),
                "trained_on": artifact.get("trained_on"),
                "feature_columns": artifact.get("feature_columns", [])
            }
            logger.info("ModelRegistry successfully loaded artifacts.", version=self.metadata["version"])
            return True
        except Exception as e:
            logger.error("Failed to load model artifacts", error=str(e))
            return False
            
    def get_model(self):
        return self.active_model
        
    def get_metadata(self):
        return self.metadata
