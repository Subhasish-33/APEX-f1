from typing import Dict, Any, List, Tuple
import structlog
import pandas as pd

logger = structlog.get_logger()

class FeatureValidator:
    def __init__(self, missing_threshold: float = 0.3):
        self.missing_threshold = missing_threshold
        
    def validate_row(self, row: Dict[str, Any]) -> Tuple[bool, str]:
        """Validate a single feature row. Returns (is_valid, reason)."""
        # Example validation rules
        if row.get("grid_position", 0) <= 0 or row.get("grid_position", 0) > 24:
            return False, "grid_position out of bounds"
            
        # Check missing percentage
        missing_count = sum(1 for v in row.values() if pd.isna(v) or v is None)
        missing_pct = missing_count / len(row) if len(row) > 0 else 1.0
        
        if missing_pct > self.missing_threshold:
            return False, f"Missing data threshold exceeded: {missing_pct:.2%}"
            
        return True, "VALID"

    def analyze_health(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate a feature health report for a batch of data."""
        nan_rates = df.isna().mean().to_dict()
        
        # Flag features with high missing rates
        unstable_features = [f for f, r in nan_rates.items() if r > self.missing_threshold]
        
        return {
            "total_rows": len(df),
            "unstable_features": unstable_features,
            "nan_rates": nan_rates
        }
