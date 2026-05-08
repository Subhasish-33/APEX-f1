from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Dict, Optional
from apps.api.dependencies import get_db
from apps.api.analytics.search_cortex import SearchCortex
from pydantic import BaseModel

router = APIRouter()
DBSession = Annotated[AsyncSession, Depends(get_db)]

class SearchResult(BaseModel):
    type: str
    id: Optional[int] = None
    ref: Optional[str] = None
    label: str
    code: Optional[str] = None
    reason: Optional[str] = None
    action: Optional[str] = None
    dna: Optional[str] = None

class UnifiedSearchResponse(BaseModel):
    query: str
    intent: str
    results: List[SearchResult]
    suggestions: List[str]

@router.get("/search", response_model=UnifiedSearchResponse)
async def semantic_search(
    q: str,
    session: DBSession,
    semantic: bool = Query(True, description="Enable vector similarity search")
):
    cortex = SearchCortex(session)
    
    intent_data = await cortex.parse_intent(q)
    semantic = await cortex.get_semantic_results(q)
    lexical = await cortex.get_lexical_results(q)
    
    # Combine results with semantic priority
    all_results = semantic + lexical
    
    return {
        "query": q,
        "intent": intent_data["intent"],
        "results": all_results,
        "suggestions": [
            "Best wet-weather driver",
            "Most chaotic season",
            "Pressure-resistant drivers",
            "Closest title fight"
        ]
    }
