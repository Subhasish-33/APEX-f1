from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, UniqueConstraint, JSON, Boolean, Text, Enum, Index
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum
import uuid

# ── Media Pipeline Enums ─────────────────────────────────────────────────────

class MediaEntityType(enum.Enum):
    """What real-world entity this asset belongs to."""
    DRIVER    = "DRIVER"
    TEAM      = "TEAM"
    CIRCUIT   = "CIRCUIT"
    RACE      = "RACE"
    ARTICLE   = "ARTICLE"

class MediaCategory(enum.Enum):
    """Functional role of the asset within the UI."""
    HEADSHOT    = "HEADSHOT"       # Driver portrait — transparent PNG
    HERO        = "HERO"           # Driver editorial action shot
    LOGO        = "LOGO"           # Team/constructor mark — SVG preferred
    CAR_RENDER  = "CAR_RENDER"     # Side-profile or 3/4 perspective car
    HELMET      = "HELMET"         # Driver helmet macro shot
    MAP         = "MAP"            # Circuit layout — APEX-rendered SVG
    FLAG        = "FLAG"           # Nationality flag
    THUMBNAIL   = "THUMBNAIL"      # Race/round editorial thumbnail (16:9)
    ARTICLE_HERO = "ARTICLE_HERO"  # Full-bleed news hero

class MediaSourceType(enum.Enum):
    """Legal provenance tier. MUST be set before clearance."""
    OFFICIAL_PRESS  = "OFFICIAL_PRESS"   # Team/FIA press kits — editorial rights
    WIKIMEDIA       = "WIKIMEDIA"        # Wikimedia Commons — CC-BY-SA
    OSM_DERIVED     = "OSM_DERIVED"      # OpenStreetMap geometry — ODbL
    STOCK           = "STOCK"            # Unsplash/Pexels — commercial free
    AI_GENERATED    = "AI_GENERATED"     # APEX proprietary generation
    OPENF1_EPHEMERAL = "OPENF1_EPHEMERAL" # OpenF1 URLs — NOT for long-term use

class MediaLifecycleState(enum.Enum):
    """Explicit lifecycle state — the frontend always knows render safety."""
    PROCESSING        = "PROCESSING"        # Downloaded, not yet verified
    PENDING_CLEARANCE = "PENDING_CLEARANCE" # Verified, awaiting legal sign-off
    ACTIVE            = "ACTIVE"            # Cleared, optimized, safe to render
    DEGRADED          = "DEGRADED"          # Serving but from fallback chain
    ARCHIVED          = "ARCHIVED"          # Superseded — do not render
    FAILED            = "FAILED"            # Processing or verification failure

class FallbackStrategy(enum.Enum):
    """What the frontend renders when the primary asset is unavailable."""
    TEAM_COLOR_GLOW   = "TEAM_COLOR_GLOW"   # CSS animated team-color glow shape
    SILHOUETTE_WIRE   = "SILHOUETTE_WIRE"   # APEX-styled driver wireframe avatar
    GENERIC_TRACK     = "GENERIC_TRACK"     # Generic circuit outline
    COLOR_BLOCK       = "COLOR_BLOCK"       # Solid team primary color block
    APEX_PLACEHOLDER  = "APEX_PLACEHOLDER"  # Branded "Signal Lost" panel

Base = declarative_base()

class SessionState(enum.Enum):
    SCHEDULED = "scheduled"
    GREEN_FLAG = "green_flag"
    RED_FLAG = "red_flag"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class TelemetryState(enum.Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    DELAYED = "delayed"
    STALE = "stale"

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
    state = Column(Enum(SessionState), default=SessionState.SCHEDULED)
    telemetry_state = Column(Enum(TelemetryState), default=TelemetryState.UNAVAILABLE)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ingestion_version = Column(String)

    __table_args__ = (UniqueConstraint("year", "round", name="uq_race_year_round"),)

    circuit = relationship("Circuit")
    results = relationship("Result", back_populates="race")
    driver_standings = relationship("DriverStanding", back_populates="race")
    constructor_standings = relationship("ConstructorStanding", back_populates="race")
    qualifying = relationship("Qualifying", back_populates="race")
    pit_stops = relationship("PitStop", back_populates="race")
    sessions = relationship("Session", back_populates="race")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    name = Column(String) # FP1, FP2, FP3, Qualifying, Sprint, Race
    date = Column(DateTime)
    
    state = Column(Enum(SessionState), default=SessionState.SCHEDULED)
    telemetry_state = Column(Enum(TelemetryState), default=TelemetryState.UNAVAILABLE)
    
    race = relationship("Race", back_populates="sessions")

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
<<<<<<< HEAD
=======

class MediaAsset(Base):
    """
    Tier 5 — Canonical Media Registry.

    This is the single source of truth for every visual asset on the APEX platform.
    The frontend MUST resolve all media through this table — no direct URL
    embedding, no guessing, no silent fallbacks.

    Lifecycle: PROCESSING → PENDING_CLEARANCE → ACTIVE
                                              → FAILED
                         ACTIVE → ARCHIVED
                         ACTIVE → DEGRADED (fallback serving)
    """
    __tablename__ = "media_assets"

    # ── Identity ──────────────────────────────────────────────────────────────
    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type  = Column(Enum(MediaEntityType), nullable=False)   # DRIVER, TEAM …
    entity_ref   = Column(String, nullable=False, index=True)       # 'hamilton', 'ferrari'
    category     = Column(Enum(MediaCategory),   nullable=False)    # HEADSHOT, LOGO …
    season       = Column(Integer, nullable=True)                   # 2025; NULL = evergreen
    priority     = Column(Integer, default=10)                      # lower = preferred

    # ── Storage ───────────────────────────────────────────────────────────────
    source_url   = Column(Text, nullable=True)   # Original provenance URL
    internal_url = Column(Text, nullable=True)   # APEX CDN/Storage path (served in prod)
    cdn_url      = Column(Text, nullable=True)   # Final delivery URL (CDN edge)

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    lifecycle_state = Column(
        Enum(MediaLifecycleState),
        default=MediaLifecycleState.PROCESSING,
        nullable=False,
        index=True,
    )
    clearance_status  = Column(Boolean, default=False, nullable=False)  # legal sign-off
    is_production_safe = Column(Boolean, default=False, nullable=False)  # final gate

    # ── Provenance & Legal Governance ─────────────────────────────────────────
    source_type      = Column(Enum(MediaSourceType), nullable=True)
    owner_id         = Column(String, nullable=True)   # "Scuderia Ferrari Press Office"
    license_type     = Column(String, nullable=True)   # "CC-BY-SA-4.0" / "APEX_PROPRIETARY"
    attribution_text = Column(Text,   nullable=True)   # Rendered in UI legal overlay
    license_url      = Column(Text,   nullable=True)   # Link to license deed
    attribution_required = Column(Boolean, default=False)  # Must show attribution in UI

    # ── Verification ──────────────────────────────────────────────────────────
    checksum         = Column(String, nullable=True)  # SHA-256 of downloaded bytes
    checksum_verified = Column(Boolean, default=False) # Whether checksum passed
    last_verified    = Column(DateTime, nullable=True)
    verification_error = Column(Text, nullable=True)  # Last failure message

    # ── Processing Metadata (CLS Prevention) ─────────────────────────────────
    # These fields let the frontend reserve exact space before the image loads.
    width            = Column(Integer, nullable=True)
    height           = Column(Integer, nullable=True)
    aspect_ratio     = Column(Float,   nullable=True)  # width / height
    blurhash         = Column(String,  nullable=True)  # BlurHash for LQIP placeholder
    has_transparency = Column(Boolean, nullable=True)  # PNG alpha channel present

    # ── Optimization Status ───────────────────────────────────────────────────
    avif_available   = Column(Boolean, default=False)  # AVIF variant generated
    webp_available   = Column(Boolean, default=False)  # WebP variant generated
    optimization_version = Column(Integer, default=0)  # Bump to trigger regen

    # ── Color & Composition Metadata ─────────────────────────────────────────
    # Stored as JSON to avoid separate palette table. Frontend reads this
    # to theme backgrounds, glows, and typography without extra round-trips.
    dominant_palette = Column(JSON, nullable=True)
    # e.g. {"vibrant": "#E10600", "dark": "#15151E", "muted": "#3D3D3D", "light": "#FFFFFF"}
    focal_point      = Column(JSON, nullable=True)
    # e.g. {"x": 0.5, "y": 0.3}  — normalized 0–1, for responsive crop rules

    # ── Variant Orchestration ─────────────────────────────────────────────────
    # Rather than duplicating rows per variant, we store a variant manifest here.
    # Each key maps to a cdn_url for that variant size.
    # Variants are generated by generate_variants.py and certified separately.
    variants = Column(JSON, nullable=True)
    # {
    #   "thumbnail":  {"url": "…", "width": 120, "height": 120},
    #   "card":       {"url": "…", "width": 400, "height": 300},
    #   "hero":       {"url": "…", "width": 1200, "height": 800},
    #   "mobile":     {"url": "…", "width": 375, "height": 250},
    #   "retina":     {"url": "…", "width": 2400, "height": 1600},
    #   "cinematic":  {"url": "…", "width": 1920, "height": 1080},
    #   "blur":       {"url": "…", "width": 20,   "height": 14}
    # }

    # ── Fallback Chain ────────────────────────────────────────────────────────
    fallback_strategy = Column(
        Enum(FallbackStrategy),
        default=FallbackStrategy.APEX_PLACEHOLDER,
        nullable=False,
    )

    # ── Audit Trail ───────────────────────────────────────────────────────────
    audit_log    = Column(JSON, nullable=True)
    # [{"action": "INGESTED", "by": "ingest_media.py", "at": "2025-…"},
    #  {"action": "VERIFIED", "by": "verify_media.py",  "at": "2025-…"},
    #  {"action": "CERTIFIED","by": "audit_media.py",   "at": "2025-…"}]

    ingestion_source = Column(String, nullable=True)  # Script that created this row
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        # Unique slot per entity/category/season — prevents duplicate ingestion
        UniqueConstraint("entity_type", "entity_ref", "category", "season",
                         name="uq_media_slot"),
        # Fast lookup by lifecycle state for the certification queue
        Index("ix_media_lifecycle", "lifecycle_state"),
        # Fast lookup for the frontend resolver
        Index("ix_media_entity_lookup", "entity_type", "entity_ref", "category"),
    )

    def __repr__(self):
        return (
            f"<MediaAsset({self.entity_type}/{self.entity_ref}/{self.category} "
            f"state={self.lifecycle_state} cleared={self.clearance_status})>"
        )

>>>>>>> 9ef98e3 (feat(media): Tier 5 Phase 1 - Deterministic Media Infrastructure)
