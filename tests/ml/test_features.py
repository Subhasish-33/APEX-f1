import pytest
from apps.api.ml.validation import FeatureValidator

def test_feature_validation_out_of_bounds():
    validator = FeatureValidator(missing_threshold=0.3)
    
    valid_row = {"grid_position": 1, "driver_recent_form_5": 10.0}
    is_valid, _ = validator.validate_row(valid_row)
    assert is_valid is True
    
    invalid_row = {"grid_position": 25, "driver_recent_form_5": 10.0}
    is_valid, reason = validator.validate_row(invalid_row)
    assert is_valid is False
    assert "out of bounds" in reason

def test_feature_validation_missing_threshold():
    validator = FeatureValidator(missing_threshold=0.3)
    
    # 2 out of 4 missing (50%)
    invalid_row = {
        "grid_position": 1, 
        "f2": None, 
        "f3": float('nan'), 
        "f4": 10.0
    }
    is_valid, reason = validator.validate_row(invalid_row)
    assert is_valid is False
    assert "Missing data threshold exceeded" in reason
