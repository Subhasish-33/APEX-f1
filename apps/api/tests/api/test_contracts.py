import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from schemas.envelope import ResponseEnvelope, ErrorEnvelope

@pytest.mark.asyncio
async def test_drivers_paginated_contract():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/drivers?page=1&limit=5")
        assert response.status_code == 200
        
        # Parse against canonical envelope
        data = response.json()
        envelope = ResponseEnvelope(**data)
        
        assert envelope.data is not None
        assert isinstance(envelope.data, list)
        assert envelope.meta.version == "v1"
        assert envelope.meta.execution_ms is not None
        
        # Test Pagination
        assert envelope.pagination is not None
        assert envelope.pagination.page == 1
        assert envelope.pagination.size == 5

@pytest.mark.asyncio
async def test_not_found_error_contract():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/drivers/UNKNOWN_REF")
        assert response.status_code == 404
        
        # Parse against error envelope
        data = response.json()
        envelope = ErrorEnvelope(**data)
        
        assert envelope.error.code == "RESOURCE_NOT_FOUND"
        assert envelope.error.status == 404
        assert envelope.meta.version == "v1"

@pytest.mark.asyncio
async def test_standings_state_contract():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/standings/drivers?season=2024")
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            envelope = ResponseEnvelope(**data)
            # Check state explicitly
            assert envelope.state.freshness in ["LIVE", "STALE", "HISTORICAL"]
            assert envelope.state.certification in ["CERTIFIED", "PROVISIONAL", "UNVERIFIED"]

@pytest.mark.asyncio
async def test_live_timing_contract():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/live/timing")
        # In a test DB it might not find an active session, but we still test the contract logic
        assert response.status_code in [200, 404]
        if response.status_code == 404:
             envelope = ErrorEnvelope(**response.json())
             assert envelope.error.code == "RESOURCE_NOT_FOUND"
