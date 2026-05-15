from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Dict, Optional
from memory_engine.models import MemoryMoment, MemoryEcho, MemoryClassification, MemoryType
import logging

log = logging.getLogger("apex.memory_engine")

class MemoryEngine:
    """
    The orchestrator for the APEX-F1 Legacy Layer.
    Connects live data to historical significance, creating emotional echoes.
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_driver_legacy(self, driver_ref: str) -> Dict:
        """
        Retrieves a driver's career narrative, transforming stats into mythology.
        """
        stmt = (
            select(MemoryMoment)
            .where(MemoryMoment.driver_ref == driver_ref)
            .order_by(MemoryMoment.created_at.desc())
        )
        result = await self.session.execute(stmt)
        moments = result.scalars().all()
        
        # Analyze the distribution to determine the core emotional archetype
        classifications = [m.classification.value for m in moments]
        archetype = self._determine_archetype(classifications)
        
        return {
            "driver_ref": driver_ref,
            "archetype": archetype,
            "moments": [
                {
                    "id": m.id,
                    "title": m.title,
                    "classification": m.classification.value,
                    "editorial": m.editorial_text,
                    "cinematic_context": m.cinematic_context,
                }
                for m in moments
            ]
        }

    async def get_temporal_echoes(self, circuit_ref: str, driver_ref: str) -> List[Dict]:
        """
        Detects historical echoes for a current context.
        E.g., Leclerc + Monaco -> Returns the Tragedy echoes.
        """
        stmt = (
            select(MemoryMoment)
            .where(and_(
                MemoryMoment.circuit_ref == circuit_ref,
                MemoryMoment.driver_ref == driver_ref
            ))
            .order_by(MemoryMoment.created_at.desc())
        )
        result = await self.session.execute(stmt)
        moments = result.scalars().all()
        
        return [
            {
                "id": m.id,
                "title": m.title,
                "classification": m.classification.value,
                "editorial_text": m.editorial_text,
                "pacing_hint": "slow_decompression" if m.classification == MemoryClassification.TRAGIC else "cinematic_tension"
            }
            for m in moments
        ]

    def _determine_archetype(self, classifications: List[str]) -> str:
        """Determines driver mythology based on their highest density of memory classifications."""
        if not classifications:
            return "THE CONTENDER"
            
        count = {c: classifications.count(c) for c in set(classifications)}
        dominant_class = max(count, key=count.get)
        
        archetypes = {
            "DOMINANT": "THE INEVITABLE",
            "TRAGIC": "THE UNFINISHED DESTINY",
            "LEGENDARY": "THE LEGACY",
            "REDEMPTIVE": "THE SURVIVOR",
            "CHAOTIC": "THE DISRUPTOR",
        }
        
        return archetypes.get(dominant_class, "THE VETERAN")

    async def retrieve_iconic_radio(self, moment_id: int) -> Optional[Dict]:
        """
        Retrieves a radio moment formatted as a sacred artifact.
        """
        moment = await self.session.get(MemoryMoment, moment_id)
        if not moment or not moment.radio_transcript:
            return None
            
        return {
            "title": moment.title,
            "transcript": moment.radio_transcript,
            "classification": moment.classification.value,
            "sensory_instructions": {
                "background_opacity": 0.1,
                "motion": "stillness",
                "typography": "analog_serif"
            }
        }
