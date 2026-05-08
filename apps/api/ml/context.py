import hashlib
import json
from datetime import datetime
from typing import Dict, Any

class PredictionContext:
    """Manages the context hash for prediction reproducibility and cache invalidation."""
    
    @staticmethod
    def generate_context_hash(race_id: int, weather_prob: float, qualifying_results: list, scenario_mode: str = "normal") -> str:
        """
        Creates a reproducible cryptographic hash of the current contextual variables.
        If any of these change (e.g. weather updates, someone gets a grid penalty), 
        the hash changes, automatically invalidating cached predictions.
        """
        # Simplify qualifying results to just driver_ids to track grid order
        grid_order = [q.get("driver_id") for q in qualifying_results] if qualifying_results else []
        
        context_payload = {
            "race_id": race_id,
            "weather_prob": round(weather_prob, 2) if weather_prob else None,
            "scenario": scenario_mode,
            "grid": grid_order
        }
        
        payload_str = json.dumps(context_payload, sort_keys=True)
        return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()[:12]
        
    @staticmethod
    def create_snapshot(race_id: int, features: list) -> str:
        """Creates a snapshot ID for a set of features used in inference."""
        snapshot_payload = {
            "race_id": race_id,
            "timestamp": datetime.utcnow().isoformat(),
            "feature_count": len(features)
        }
        return hashlib.md5(json.dumps(snapshot_payload, sort_keys=True).encode("utf-8")).hexdigest()
