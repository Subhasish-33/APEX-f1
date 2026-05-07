from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, UniqueConstraint, JSON
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

class Season(Base):
    __tablename__ = "seasons"

    year = Column(Integer, primary_key=True)

class Race(Base):
    __tablename__ = "races"

    race_id = Column(Integer, primary_key=True)
    year = Column(Integer, ForeignKey("seasons.year"))
    round = Column(Integer)
    circuit_id = Column(String, ForeignKey("circuits.circuit_id"))
    name = Column(String)
    date = Column(Date)

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

    __table_args__ = (UniqueConstraint("race_id", "driver_id", name="uq_race_driver_result"),)

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