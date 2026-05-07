import httpx
import json
from apps.api.schemas import (
    DriverResponse, PaginatedResponse, ConstructorResponse, 
    CircuitResponse, RaceResponse, RaceDetailResponse,
    DriverStandingResponse, ConstructorStandingResponse
)

BASE_URL = "http://127.0.0.1:8001"

def test_endpoint(path, schema):
    print(f"Testing {path}...")
    try:
        response = httpx.get(f"{BASE_URL}{path}")
        response.raise_for_status()
        data = response.json()
        
        # Validate using Pydantic
        if hasattr(schema, "__origin__") and schema.__origin__ is PaginatedResponse:
            schema.model_validate(data)
        else:
            schema.model_validate(data)
        
        print(f"✅ {path} passed validation.")
    except Exception as e:
        print(f"❌ {path} failed: {e}")

if __name__ == "__main__":
    # List of endpoints and their expected schemas
    endpoints = [
        ("/", None),
        ("/health", None),
        ("/drivers?limit=1", PaginatedResponse[DriverResponse]),
        ("/drivers/max_verstappen", DriverResponse),
        ("/constructors?limit=1", PaginatedResponse[ConstructorResponse]),
        ("/constructors/red_bull", ConstructorResponse),
        ("/circuits?limit=1", PaginatedResponse[CircuitResponse]),
        ("/seasons/2023/races?limit=1", PaginatedResponse[RaceResponse]),
        ("/seasons/2023/standings/drivers?limit=1", PaginatedResponse[DriverStandingResponse]),
        ("/seasons/2023/standings/constructors?limit=1", PaginatedResponse[ConstructorStandingResponse]),
        ("/races/202301", RaceDetailResponse),
    ]

    for path, schema in endpoints:
        if schema:
            test_endpoint(path, schema)
        else:
            print(f"Checking {path}...")
            r = httpx.get(f"{BASE_URL}{path}")
            print(f"Status: {r.status_code}, Body: {r.json()}")
