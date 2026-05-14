from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, UniqueConstraint, JSON, Boolean, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Driver(Base):
    __tablename__ = "drivers"

    driver_id = Column(Integer, primary_key=True)
    driver_ref = Column(String, unique=True)
    code = Column(String)
    forename = Column(String)
    surname = Column(String)
    nationality = Column(String)

    results = relationship("Result", back_populates="driver")
    driver_standings = relationship("DriverStanding", back_populates="driver")
    qualifying = relationship("Qualifying", back_populates="driver")
    pit_stops = relationship("PitStop", back_populates="driver")

class Constructor(Base):
    __tablename__ = "constructors"

    constructor_id = Column(Integer, primary_key=True)
    constructor_ref = Column(String, unique=True)
    name = Column(String)
    nationality = Column(String)

    results = relationship("Result", back_populates="constructor")
    constructor_standings = relationship("ConstructorStanding", back_populates="constructor")
    qualifying = relationship("Qualifying", back_populates="constructor")

class Circuit(Base):
    __tablename__ = "circuits"

    circuit_id = Column(String, primary_key=True)
    name = Column(String)
    location = Column(String)
    country = Column(String)
    
    # Circuit Personality Metadata
    overtaking_difficulty = Column(Float) # 1-10
    downforce_level = Column(String) # LOW, MED, HIGH
    tire_degradation = Column(String) # LOW, MED, HIGH
    weather_volatility = Column(Float) # 0-1
    safety_car_probability = Column(Float) # 0-1
    top_speed_level = Column(String) # LOW, MED, HIGH
    atmosphere_description = Column(String)

class Season(Base):
    __tablename__ = "seasons"

    year = Column(Integer, primary_key=True)
    
    # Action 1: Coverage Confidence & Safety Pass
    status = Column(String, default="ARCHIVAL") # VERIFIED, PARTIAL, ARCHIVAL
    is_verified = Column(Boolean, default=False)
    coverage_confidence = Column(Float, default=0.0) # 0.0 to 1.0
    last_audit_at = Column(DateTime)

class Race(Base):
    __tablename__ = "races"

    race_id = Column(Integer, primary_key=True)
    year = Column(Integer, ForeignKey("seasons.year"))
    round = Column(Integer)
    circuit_id = Column(String, ForeignKey("circuits.circuit_id"))
    name = Column(String)
    date = Column(Date)
    laps = Column(Integer)
    
    # Session Timestamps
    fp1_date = Column(DateTime)
    fp2_date = Column(DateTime)
    fp3_date = Column(DateTime)
    qualifying_date = Column(DateTime)
    sprint_date = Column(DateTime)
    
    # Analytics
    analytics = Column(JSON) # {overtaking_index: 0.8, chaos_prob: 0.2, etc.}

    # Phase 3: State Intelligence & Freshness
    status = Column(String, default="SCHEDULED") # SCHEDULED, PENDING, LIVE, COMPLETED, ARCHIVED, CANCELED
    telemetry_available = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ingestion_version = Column(String)

    __table_args__ = (UniqueConstraint("year", "round", name="uq_race_year_round"),)

    circuit = relationship("Circuit")
    results = relationship("Result", back_populates="race")
    driver_standings = relationship("DriverStanding", back_populates="race")
    constructor_standings = relationship("ConstructorStanding", back_populates="race")
    qualifying = relationship("Qualifying", back_populates="race")
    pit_stops = relationship("PitStop", back_populates="race")

class Result(Base):
    __tablename__ = "results"

    result_id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    constructor_id = Column(Integer, ForeignKey("constructors.constructor_id"))
    grid = Column(Integer)
    position = Column(Integer)
    points = Column(Float)
    time = Column(String)
    milliseconds = Column(Integer)
    fastest_lap = Column(Integer)
    fastest_lap_time = Column(String)
    status = Column(String)
    
    # Freshness
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("race_id", "driver_id", name="uq_race_driver_result"),
        UniqueConstraint("race_id", "position", name="uq_race_position_result"),
    )

    race = relationship("Race", back_populates="results")
    driver = relationship("Driver", back_populates="results")
    constructor = relationship("Constructor", back_populates="results")

class DriverStanding(Base):
    __tablename__ = "driver_standings"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    points = Column(Float)
    position = Column(Integer)
    wins = Column(Integer, default=0)
    
    # Freshness
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (UniqueConstraint("race_id", "driver_id", name="uq_race_driver_standing"),)

    race = relationship("Race", back_populates="driver_standings")
    driver = relationship("Driver", back_populates="driver_standings")

class ConstructorStanding(Base):
    __tablename__ = "constructor_standings"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    constructor_id = Column(Integer, ForeignKey("constructors.constructor_id"))
    points = Column(Float)
    position = Column(Integer)
    wins = Column(Integer, default=0)
    
    # Freshness
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (UniqueConstraint("race_id", "constructor_id", name="uq_race_constructor_standing"),)

    race = relationship("Race", back_populates="constructor_standings")
    constructor = relationship("Constructor", back_populates="constructor_standings")

class Qualifying(Base):
    __tablename__ = "qualifying"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    constructor_id = Column(Integer, ForeignKey("constructors.constructor_id"))
    position = Column(Integer)
    q1 = Column(String)
    q2 = Column(String)
    q3 = Column(String)

    __table_args__ = (UniqueConstraint("race_id", "driver_id", name="uq_race_driver_qualifying"),)

    race = relationship("Race", back_populates="qualifying")
    driver = relationship("Driver", back_populates="qualifying")
    constructor = relationship("Constructor", back_populates="qualifying")

class PitStop(Base):
    __tablename__ = "pit_stops"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    stop = Column(Integer)
    lap = Column(Integer)
    time = Column(String)
    duration = Column(String)

    __table_args__ = (UniqueConstraint("race_id", "driver_id", "stop", name="uq_race_driver_stop"),)

    race = relationship("Race", back_populates="pit_stops")
    driver = relationship("Driver", back_populates="pit_stops")

class Stint(Base):
    """Telemetry Readiness: Strategy & Tire Data"""
    __tablename__ = "stints"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    stint_number = Column(Integer)
    compound = Column(String)
    start_lap = Column(Integer)
    end_lap = Column(Integer)
    tyre_age_at_start = Column(Integer)
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    race = relationship("Race")
    driver = relationship("Driver")

class LapTime(Base):
    __tablename__ = "lap_times"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    lap = Column(Integer)
    position = Column(Integer)
    time = Column(String)
    milliseconds = Column(Integer)

    __table_args__ = (UniqueConstraint("race_id", "driver_id", "lap", name="uq_race_driver_lap"),)

    race = relationship("Race")
    driver = relationship("Driver")

# --- AI Prediction Layer ---


class PredictionRun(Base):
    __tablename__ = "prediction_runs"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String)
    simulation_source = Column(String)
    config = Column(JSON)  # Store hyperparams or simulation settings

class PredictedRaceResult(Base):
    __tablename__ = "predicted_race_results"

    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey("prediction_runs.id"))
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    predicted_position = Column(Integer)
    probability_distribution = Column(JSON)  # Probabilities for P1, P2, P3, etc.
    confidence_score = Column(Float)

class PredictedDriverStanding(Base):
    __tablename__ = "predicted_driver_standings"

    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey("prediction_runs.id"))
    year = Column(Integer)
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    predicted_points = Column(Float)
    predicted_position = Column(Integer)
    confidence_score = Column(Float)

class PredictedConstructorStanding(Base):
    __tablename__ = "predicted_constructor_standings"

    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey("prediction_runs.id"))
    year = Column(Integer)
    constructor_id = Column(Integer, ForeignKey("constructors.constructor_id"))
    predicted_points = Column(Float)
    predicted_position = Column(Integer)
    confidence_score = Column(Float)

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey("prediction_runs.id"))
    metric_name = Column(String)
    metric_value = Column(Float)

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    lap_number = Column(Integer)
    sector1_time = Column(Float)
    sector2_time = Column(Float)
    sector3_time = Column(Float)
    lap_time = Column(Float)
    compound = Column(String)
    tire_age = Column(Integer)
    speed_trap = Column(Float)
    weather_temp = Column(Float)
    track_temp = Column(Float)

class PlatformHealth(Base):
    """Observability: Tracking ingestion health and drift"""
    __tablename__ = "platform_health"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    component = Column(String) # INGESTION, API, CACHE, RECONCILIATION
    status = Column(String) # OK, WARNING, CRITICAL
    message = Column(String)
    metadata_json = Column(JSON)
class RaceMoment(Base):
    __tablename__ = "race_moments"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    lap = Column(Integer)
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"), nullable=True)
    moment_type = Column(String) # OVERTAKE, PIT_STOP, SAFETY_CAR, FASTEST_LAP, RETIREMENT, STRATEGY_PIVOT
    description = Column(String)
    metadata_json = Column(JSON) # {gained_pos: 2, stint_compound: 'HARD', etc.}

    race = relationship("Race", back_populates="moments")
    driver = relationship("Driver")

# Update Race relationship
Race.moments = relationship("RaceMoment", back_populates="race")

class MLFeature(Base):
    __tablename__ = "ml_features"

    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    feature_vector = Column(JSON) # JSONB in Postgres, using JSON here for generic SQLAlchemy
    feature_version = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    source_hash = Column(String)
    validation_status = Column(String) # VALID, IMPUTED, REJECTED
    confidence_metadata = Column(JSON)

    __table_args__ = (UniqueConstraint("race_id", "driver_id", "feature_version", name="uq_race_driver_feature_version"),)

    race = relationship("Race")
    driver = relationship("Driver")

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, index=True)  # JOLPICA, OPENF1, etc.
    endpoint = Column(String)
    sync_type = Column(String, index=True) # HISTORICAL, LIVE, SCHEDULE, etc.
    status = Column(String, index=True)    # STARTED, COMPLETED, FAILED, RETRYING
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    records_processed = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    source_version = Column(String, nullable=True) # ETag, Hash, etc.
    
    certification_status = Column(String, default="PENDING") # PENDING, AUDITED, CERTIFIED
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<SyncLog(id={self.id}, provider='{self.provider}', status='{self.status}')>"
