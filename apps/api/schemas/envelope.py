from typing import Generic, TypeVar, Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

DataT = TypeVar("DataT")

class FreshnessState(str, Enum):
    LIVE = "LIVE"
    STALE = "STALE"
    HISTORICAL = "HISTORICAL"

class CertificationState(str, Enum):
    CERTIFIED = "CERTIFIED"
    PROVISIONAL = "PROVISIONAL"
    UNVERIFIED = "UNVERIFIED"

class MetaSchema(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    version: str = "v1"
    execution_ms: Optional[float] = None

class StateSchema(BaseModel):
    freshness: FreshnessState = FreshnessState.HISTORICAL
    certification: CertificationState = CertificationState.CERTIFIED
    degraded: bool = False

class PaginationSchema(BaseModel):
    total: int
    page: int
    size: int
    has_next: bool

class ResponseEnvelope(BaseModel, Generic[DataT]):
    data: DataT
    meta: MetaSchema = Field(default_factory=MetaSchema)
    state: StateSchema = Field(default_factory=StateSchema)
    pagination: Optional[PaginationSchema] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    status: int
    context: Optional[Dict[str, Any]] = None

class ErrorEnvelope(BaseModel):
    error: ErrorDetail
    meta: MetaSchema = Field(default_factory=MetaSchema)
