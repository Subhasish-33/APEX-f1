from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Generic, TypeVar
from datetime import date

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    total_count: int
    page: int
    limit: int
    data: List[T]

class DriverResponse(BaseModel):
    driver_id: int
    driver_ref: str
    code: Optional[str] = None
    forename: str
    surname: str
    nationality: str

    model_config = ConfigDict(from_attributes=True)

class ConstructorResponse(BaseModel):
    constructor_id: int
    constructor_ref: str
    name: str
    nationality: str

    model_config = ConfigDict(from_attributes=True)

class CircuitResponse(BaseModel):
    circuit_id: str
    name: str
    location: str
    country: str

    model_config = ConfigDict(from_attributes=True)

class RaceResponse(BaseModel):
    race_id: int
    year: int
    round: int
    circuit_id: str
    name: str
    date: date

    model_config = ConfigDict(from_attributes=True)

class ResultResponse(BaseModel):
    result_id: int
    race_id: int
    driver_id: int
    constructor_id: int
    grid: int
    position: Optional[int] = None
    points: float
    
    driver: Optional[DriverResponse] = None
    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DriverStandingResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    points: float
    position: int
    
    driver: Optional[DriverResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConstructorStandingResponse(BaseModel):
    id: int
    race_id: int
    constructor_id: int
    points: float
    position: int

    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class QualifyingResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    constructor_id: int
    position: int
    
    driver: Optional[DriverResponse] = None
    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class PitStopResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    stop: int
    lap: int
    time: str
    duration: str

    driver: Optional[DriverResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConstructorHistoryEntry(BaseModel):
    year: int
    points: float
    position: int
    wins: int

    model_config = ConfigDict(from_attributes=True)

class RaceDetailResponse(RaceResponse):
    results: List[ResultResponse] = []
    qualifying: List[QualifyingResponse] = []
    pit_stops: List[PitStopResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- AI Prediction Schemas ---

class PredictedRaceResultResponse(BaseModel):
    driver_id: int
    predicted_position: int
    probability_distribution: dict
    confidence_score: float
    driver: Optional[DriverResponse] = None

    model_config = ConfigDict(from_attributes=True)

class PredictedDriverStandingResponse(BaseModel):
    driver_id: int
    predicted_points: float
    predicted_position: int
    confidence_score: float
    driver: Optional[DriverResponse] = None

    model_config = ConfigDict(from_attributes=True)

class PredictedConstructorStandingResponse(BaseModel):
    constructor_id: int
    predicted_points: float
    predicted_position: int
    confidence_score: float
    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class TelemetryResponse(BaseModel):
    race_id: int
    driver_id: int
    lap_number: int
    sector1_time: Optional[float] = None
    sector2_time: Optional[float] = None
    sector3_time: Optional[float] = None
    lap_time: Optional[float] = None
    compound: Optional[str] = None
    tire_age: Optional[int] = None
    speed_trap: Optional[float] = None
    weather_temp: Optional[float] = None
    track_temp: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

