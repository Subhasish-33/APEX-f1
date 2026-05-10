from typing import List, Dict, Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from models import Driver, Constructor, Race, Result
from analytics.intelligence_engine import PsychologicalEngine

class SearchCortex:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.engine = PsychologicalEngine(session)

    async def parse_intent(self, q: str) -> Dict:
        """Classifies the search intent."""
        q = q.lower()
        if "vs" in q or "compare" in q or "between" in q:
            return {"intent": "DUEL", "priority": 100}
        if any(year in q for year in [str(y) for y in range(2010, 2026)]):
            return {"intent": "SEASON", "priority": 90}
        if any(word in q for word in ["wet", "rain", "storm"]):
            return {"intent": "WET_MASTERY", "priority": 80}
        if any(word in q for word in ["chaos", "unstable", "crash"]):
            return {"intent": "CHAOS", "priority": 80}
        if any(word in q for word in ["pressure", "nerves", "stability"]):
            return {"intent": "PSYCHOLOGY", "priority": 80}
        return {"intent": "GENERAL", "priority": 50}

    async def get_semantic_results(self, q: str, context: Optional[Dict] = None) -> List[Dict]:
        """Returns results based on semantic concept mapping."""
        intent = await self.parse_intent(q)
        q = q.lower()
        
        results = []

        if intent["intent"] == "WET_MASTERY":
            # Logic: Return drivers with high wet skill (mocked for now, or based on specific race results)
            results.append({
                "type": "SHORTCUT",
                "label": "Wet Weather Specialists",
                "reason": "Analyzed high-performance variance in rain-affected sessions.",
                "action": "JUMP_TO_INTELLIGENCE",
                "dna": "TECHNICAL"
            })
        
        if intent["intent"] == "DUEL":
            # Extract drivers from string (e.g. "Hamilton vs Max")
            # For now, we'll return a generic battle shortcut
            results.append({
                "type": "SHORTCUT",
                "label": "Active Rivalry Simulation",
                "reason": "Matchup detected in query string.",
                "action": "JUMP_TO_BATTLE",
                "dna": "WARFARE"
            })

        return results

    async def get_lexical_results(self, q: str) -> List[Dict]:
        """Standard full-text search across entities."""
        q_clean = q.strip().lower()
        
        # 1. Search Drivers
        driver_stmt = select(Driver).where(
            or_(
                Driver.surname.ilike(f"%{q_clean}%"),
                Driver.forename.ilike(f"%{q_clean}%"),
                Driver.code.ilike(f"%{q_clean}%")
            )
        ).limit(5)
        drivers = (await self.session.execute(driver_stmt)).scalars().all()
        
        # 2. Search Constructors
        const_stmt = select(Constructor).where(
            or_(
                Constructor.name.ilike(f"%{q_clean}%"),
                Constructor.constructor_ref.ilike(f"%{q_clean}%")
            )
        ).limit(3)
        constructors = (await self.session.execute(const_stmt)).scalars().all()
        
        # 3. Search Races
        race_stmt = select(Race).where(
            Race.name.ilike(f"%{q_clean}%")
        ).order_by(Race.year.desc()).limit(5)
        races = (await self.session.execute(race_stmt)).scalars().all()
        
        formatted = []
        for d in drivers:
            formatted.append({"type": "DRIVER", "id": d.driver_id, "ref": d.driver_ref, "label": f"{d.forename} {d.surname}", "code": d.code})
        for c in constructors:
            formatted.append({"type": "TEAM", "id": c.constructor_id, "ref": c.constructor_ref, "label": c.name})
        for r in races:
            formatted.append({"type": "RACE", "id": r.race_id, "label": f"{r.year} {r.name}"})
            
        return formatted
