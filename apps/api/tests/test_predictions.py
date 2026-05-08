import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from apps.api.main import app

client = TestClient(app)

@pytest.fixture
def mock_db_session():
    with patch("apps.api.db.get_db") as mock_get_db:
        mock_session = AsyncMock()
        mock_get_db.return_value = mock_session
        yield mock_session

@pytest.fixture
def mock_redis():
    with patch("redis.asyncio.Redis") as mock_redis_class:
        mock_client = AsyncMock()
        mock_redis_class.return_value = mock_client
        # Setup default cache miss
        mock_client.get.return_value = None
        yield mock_client

@pytest.fixture
def mock_inference_engine():
    # The inference engine is attached to app.state
    engine = MagicMock()
    engine.is_ready = True
    engine.registry.get_metadata.return_value = {"version": "test_v1"}
    
    # Mock predict method to return a dummy dataframe
    import pandas as pd
    def mock_predict(*args, **kwargs):
        return pd.DataFrame([
            {"driver_id": 1, "predicted_position": 1, "grid_position": 2},
            {"driver_id": 2, "predicted_position": 2, "grid_position": 1}
        ])
    engine.predict = mock_predict
    
    app.state.inference_engine = engine
    yield engine

@patch("apps.api.ml.features.FeatureBuilder.build_full_feature_vector")
def test_predict_race_success(mock_build_features, mock_db_session, mock_redis, mock_inference_engine):
    """Test successful prediction with cache miss (calculates fresh)."""
    # Mock features being returned successfully
    mock_build_features.return_value = {"grid": 2, "driver_id": 1}
    
    response = client.post("/predictions/race", json={"race_id": 1144})
    
    assert response.status_code == 200
    data = response.json()
    assert data["race_id"] == 1144
    assert data["regime_type"] != "AWAITING_QUALIFYING"
    assert data["model_version"] == "test_v1"
    assert len(data["predictions"]) > 0
    assert data["predictions"][0]["predicted_position"] in [1, 2]
    
    # Assert Redis was called to set the cache
    mock_redis.setex.assert_called_once()

@patch("apps.api.ml.features.FeatureBuilder.build_full_feature_vector")
def test_predict_race_missing_features(mock_build_features, mock_db_session, mock_redis, mock_inference_engine):
    """Test graceful degradation when qualifying/features are missing."""
    # Mock features returning None (missing)
    mock_build_features.return_value = None
    
    response = client.post("/predictions/race", json={"race_id": 1145})
    
    assert response.status_code == 200
    data = response.json()
    # Should gracefully return empty predictions with specific regime type
    assert data["regime_type"] == "AWAITING_QUALIFYING"
    assert data["fallback_mode_used"] == "Pending"
    assert len(data["predictions"]) == 0

def test_predict_race_cache_hit(mock_db_session, mock_redis, mock_inference_engine):
    """Test that a cached response is returned immediately without building features."""
    import json
    
    # Set up cache hit
    mock_redis.get.return_value = json.dumps({
        "race_id": 1144,
        "race_name": "Cached Race",
        "model_version": "cached_v1",
        "calibration_version": "cached",
        "generated_at": "2026-05-08T00:00:00",
        "prediction_context": "hash",
        "regime_type": "CACHED",
        "confidence_summary": "HIGH",
        "predictions": []
    })
    
    with patch("apps.api.ml.features.FeatureBuilder.build_full_feature_vector") as mock_build:
        response = client.post("/predictions/race", json={"race_id": 1144})
        
        assert response.status_code == 200
        data = response.json()
        assert data["model_version"] == "cached_v1"
        assert data["regime_type"] == "CACHED"
        
        # Ensure we didn't try to calculate features
        mock_build.assert_not_called()
