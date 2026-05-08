import pytest
from datetime import datetime
from apps.api.ml.features import LeakageValidator

def test_leakage_firewall_future_data():
    """Test that data from after the target race is blocked."""
    target_race_date = datetime(2023, 5, 28)
    future_data_date = datetime(2023, 6, 4)
    
    with pytest.raises(ValueError, match="CRITICAL LEAKAGE DETECTED"):
        LeakageValidator.assert_pre_race(target_race_date, future_data_date, is_qualifying=False)

def test_leakage_firewall_same_day_race_data():
    """Test that data from the same day is blocked unless explicitly qualifying."""
    target_race_date = datetime(2023, 5, 28)
    same_day_data = datetime(2023, 5, 28)
    
    with pytest.raises(ValueError, match="Same-day data used"):
        LeakageValidator.assert_pre_race(target_race_date, same_day_data, is_qualifying=False)

def test_leakage_firewall_same_day_qualifying():
    """Test that qualifying data on the same day is allowed."""
    target_race_date = datetime(2023, 5, 28)
    same_day_data = datetime(2023, 5, 28)
    
    # Should not raise an exception
    LeakageValidator.assert_pre_race(target_race_date, same_day_data, is_qualifying=True)

def test_leakage_firewall_historical_data():
    """Test that purely historical data is allowed."""
    target_race_date = datetime(2023, 5, 28)
    historical_data = datetime(2023, 5, 21)
    
    # Should not raise an exception
    LeakageValidator.assert_pre_race(target_race_date, historical_data, is_qualifying=False)
