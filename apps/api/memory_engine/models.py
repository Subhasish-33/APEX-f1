import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

# ── Memory Classification Taxonomy ──────────────────────────────────────────

class MemoryClassification(enum.Enum):
    """Deterministic taxonomy for emotional significance."""
    LEGENDARY       = "LEGENDARY"       # Awe-inspiring, historic peak
    TRAGIC          = "TRAGIC"          # Heartbreak, sudden loss, failure
    DOMINANT        = "DOMINANT"        # Untouchable execution (e.g., Verstappen 2023)
    CHAOTIC         = "CHAOTIC"         # Rain masterclasses, multi-car crashes
    REDEMPTIVE      = "REDEMPTIVE"      # Overcoming prior failure
    ICONIC          = "ICONIC"          # Culturally significant, radio moments
    CONTROVERSIAL   = "CONTROVERSIAL"   # Title deciders, stewards decisions
    TRANSITIONAL    = "TRANSITIONAL"    # End of an era, retirement, team switch

class MemoryType(enum.Enum):
    """The type of artifact acting as a memory anchor."""
    RACE_ARC        = "RACE_ARC"        # Full race narrative
    RADIO_CLIP      = "RADIO_CLIP"      # Sacred audio artifact
    BATTLE          = "BATTLE"          # On-track rivalry sequence
    CAREER_MOMENT   = "CAREER_MOMENT"   # Specific driver milestone

# ── Memory Models ─────────────────────────────────────────────────────────

class MemoryMoment(Base):
    """
    The core Memory Engine artifact.
    Preserves the emotional narrative of a specific event.
    """
    __tablename__ = "memory_moments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    classification = Column(Enum(MemoryClassification), nullable=False)
    memory_type = Column(Enum(MemoryType), nullable=False)
    
    # Associated Entities (soft links to allow flexible querying)
    driver_ref = Column(String(100), nullable=True, index=True)
    team_ref = Column(String(100), nullable=True, index=True)
    circuit_ref = Column(String(100), nullable=True, index=True)
    race_id = Column(Integer, ForeignKey("races.race_id"), nullable=True)

    # Narrative content
    editorial_text = Column(Text, nullable=False)
    cinematic_context = Column(JSON, nullable=True) # E.g., visual grading hints, pacing
    
    # Sacred Radio
    radio_transcript = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    echoes = relationship("MemoryEcho", foreign_keys="MemoryEcho.source_moment_id", back_populates="source_moment")


class MemoryEcho(Base):
    """
    Temporal Memory Layering.
    Connects historical moments to create narrative echoes (e.g., Monaco heartbreaks).
    """
    __tablename__ = "memory_echoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_moment_id = Column(Integer, ForeignKey("memory_moments.id"), nullable=False)
    echo_moment_id = Column(Integer, ForeignKey("memory_moments.id"), nullable=False)
    
    echo_theme = Column(String(100), nullable=False) # e.g., "MONACO_CURSE", "RAIN_MASTERY"
    editorial_connection = Column(Text, nullable=True)

    source_moment = relationship("MemoryMoment", foreign_keys=[source_moment_id], back_populates="echoes")
    echo_moment = relationship("MemoryMoment", foreign_keys=[echo_moment_id])
