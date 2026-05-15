import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from analytics.search_cortex import SearchCortex
from schemas.envelope import ResponseEnvelope, MetaSchema, StateSchema

class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def semantic_search(self, query: str) -> ResponseEnvelope[Dict[str, Any]]:
        start_time = time.perf_counter()
        
        cortex = SearchCortex(self.db)
        
        intent_data = await cortex.parse_intent(query)
        semantic = await cortex.get_semantic_results(query)
        lexical = await cortex.get_lexical_results(query)
        
        all_results = semantic + lexical
        
        data = {
            "query": query,
            "intent": intent_data["intent"],
            "results": all_results,
            "suggestions": [
                "Best wet-weather driver",
                "Most chaotic season",
                "Pressure-resistant drivers",
                "Closest title fight"
            ]
        }
        
        execution_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return ResponseEnvelope(
            data=data,
            meta=MetaSchema(execution_ms=execution_ms),
            state=StateSchema()
        )
