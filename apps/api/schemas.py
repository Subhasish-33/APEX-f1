from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Generic, TypeVar, Dict
from datetime import date, datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    total_count: int
    page: int
    limit: int
    data: List[T]
    freshness: Optional[datetime] = None

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
    
    # Personality Metadata
    overtaking_difficulty: Optional[float] = None
    downforce_level: Optional[str] = None
    tire_degradation: Optional[str] = None
    weather_volatility: Optional[float] = None
    safety_car_probability: Optional[float] = None
    top_speed_level: Optional[str] = None
    atmosphere_description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RaceResponse(BaseModel):
    race_id: int
    year: int
    round: int
    circuit_id: str
    name: str
    date: date
    laps: Optional[int] = None
    
    # Session Timestamps
    fp1_date: Optional[datetime] = None
    fp2_date: Optional[datetime] = None
    fp3_date: Optional[datetime] = None
    qualifying_date: Optional[datetime] = None
    sprint_date: Optional[datetime] = None
    
    # Analytics
    analytics: Optional[dict] = None

    # Phase 3: State Intelligence & Freshness
    status: str = "SCHEDULED"
    telemetry_available: bool = False
    last_updated: Optional[datetime] = None
    ingestion_version: Optional[str] = None

    circuit: Optional[CircuitResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ResultResponse(BaseModel):
    result_id: int
    race_id: int
    driver_id: int
    constructor_id: int
    grid: int
    position: Optional[int] = None
    points: float
    time: Optional[str] = None
    milliseconds: Optional[int] = None
    fastest_lap: Optional[int] = None
    fastest_lap_time: Optional[str] = None
    status: Optional[str] = None
    last_updated: Optional[datetime] = None
    
    driver: Optional[DriverResponse] = None
    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DriverStandingResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    points: float
    position: int
    last_updated: Optional[datetime] = None
    
    driver: Optional[DriverResponse] = None
    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConstructorStandingResponse(BaseModel):
    id: int
    race_id: int
    constructor_id: int
    points: float
    position: int
    last_updated: Optional[datetime] = None

    constructor: Optional[ConstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

class QualifyingResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    constructor_id: int
    position: int
    q1: Optional[str] = None
    q2: Optional[str] = None
    q3: Optional[str] = None
    
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

class StintResponse(BaseModel):
    id: int
    race_id: int
    driver_id: int
    stint_number: int
    compound: str
    start_lap: int
    end_lap: int
    tyre_age_at_start: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)

class RaceMomentResponse(BaseModel):
    id: int
    race_id: int
    lap: int
    driver_id: Optional[int] = None
    moment_type: str
    description: str
    metadata_json: Optional[dict] = None
    
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
    stints: List[StintResponse] = []
    moments: List[RaceMomentResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PredictionItem(BaseModel):
    predicted_position: int
    driver_ref: str
    constructor: str
    win_probability: float
    podium_probability: float
    top10_probability: float
    dnf_probability: float
    confidence_band: str # "HIGH", "MEDIUM", "LOW"
    uncertainty_score: float
    prediction_factors: List[str] # SHAP explanations
    qualifying_position: Optional[int] = None
    projected_delta: Optional[str] = None
    
    driver: Optional[DriverResponse] = None

    model_config = ConfigDict(from_attributes=True)

class PredictionResponse(BaseModel):
    race_id: int
    race_name: str
    model_version: str
    calibration_version: str
    generated_at: datetime
    prediction_context: str # Hash
    regime_type: str
    confidence_summary: str
    fallback_mode_used: Optional[str] = None
    predictions: List[PredictionItem]

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

class RivalryResponse(BaseModel):
    driver_ids: List[int]
    intensity: float
    encounters: int
    driver_names: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)

class SeasonIntelligenceResponse(BaseModel):
    year: int
    dna: str # "Chaos Era", "Dominance", etc.
    tension_score: float # 0-100
    volatility_index: Dict[int, float]
    pressure_map: Dict[int, float]
    rivalries: List[RivalryResponse]
    storylines: List[str]

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

class SeasonResponse(BaseModel):
    year: int
    status: str
    is_verified: bool
    coverage_confidence: float
    last_audit_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlatformHealthResponse(BaseModel):
    id: int
    timestamp: datetime
    component: str
    status: str
    message: str
    metadata_json: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class UnifiedStandingsResponse(BaseModel):
    season: int
    status: str
    is_verified: bool
    coverage_confidence: float
    last_audit_at: datetime
    last_race_id: Optional[int] = None
    last_race_name: Optional[str] = None
    drivers: List[DriverStandingResponse]
    constructors: List[ConstructorStandingResponse]
    freshness: datetime

