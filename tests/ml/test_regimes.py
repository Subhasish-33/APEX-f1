import pytest
from apps.api.ml.regimes import get_regime_for_year, calculate_temporal_decay, F1Era

def test_regime_segmentation():
    assert get_regime_for_year(2010) == F1Era.V8
    assert get_regime_for_year(2020) == F1Era.HYBRID
    assert get_regime_for_year(2023) == F1Era.GROUND_EFFECT
    assert get_regime_for_year(2026) == F1Era.NEXT_GEN

def test_temporal_decay_logic():
    # Same year = weight of 1.0
    assert calculate_temporal_decay(2023, 2023) == 1.0
    
    # Half life of 2 years means data from 2 years ago has weight 0.5
    assert abs(calculate_temporal_decay(2023, 2021, half_life_years=2.0) - 0.5) < 0.01
    
    # Future data should return 0.0 (leakage fallback)
    assert calculate_temporal_decay(2023, 2024) == 0.0
