import numpy as np
from typing import Dict, Any, Optional

class F1Era:
    V8 = "V8_ERA" # 2006 - 2013
    HYBRID = "HYBRID_ERA" # 2014 - 2021
    GROUND_EFFECT = "GROUND_EFFECT_ERA" # 2022 - 2025
    NEXT_GEN = "NEXT_GEN_ERA" # 2026+

def get_regime_for_year(year: int) -> str:
    """Segment F1 eras to handle distribution shifts."""
    if year <= 2013:
        return F1Era.V8
    elif year <= 2021:
        return F1Era.HYBRID
    elif year <= 2025:
        return F1Era.GROUND_EFFECT
    else:
        return F1Era.NEXT_GEN

def calculate_temporal_decay(target_year: int, source_year: int, half_life_years: float = 2.0) -> float:
    """Calculate exponential decay weight for historical data."""
    if source_year > target_year:
        return 0.0 # Leakage protection fallback
    
    delta_years = target_year - source_year
    weight = np.exp(-np.log(2) * delta_years / half_life_years)
    return float(weight)
