import abc
import time
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from models import SyncLog

logger = logging.getLogger(__name__)

class BaseIngestionJob(abc.ABC):
    """
    The standardized contract for all APEX-F1 ingestion jobs.
    Every job must implement the core lifecycle methods.
    """
    
    provider: str = "UNKNOWN"
    sync_type: str = "GENERIC"
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.log_entry: Optional[SyncLog] = None

    @abc.abstractmethod
    async def run(self, **kwargs) -> Dict[str, Any]:
        """The main ingestion logic."""
        pass

    @abc.abstractmethod
    async def rollback(self):
        """Logic to revert partial changes on failure."""
        pass

    @abc.abstractmethod
    async def audit(self) -> bool:
        """Post-ingestion integrity check."""
        return True

    @abc.abstractmethod
    async def certify(self) -> bool:
        """Promotion to Verified Truth."""
        return False

    async def start_sync(self, endpoint: str):
        self.log_entry = SyncLog(
            provider=self.provider,
            endpoint=endpoint,
            sync_type=self.sync_type,
            status="STARTED",
            started_at=datetime.utcnow()
        )
        self.db.add(self.log_entry)
        await self.db.commit()
        await self.db.refresh(self.log_entry)
        return self.log_entry.id

    async def end_sync(self, status: str, processed=0, updated=0, failed=0, error=None, version=None):
        if not self.log_entry:
            return
        
        self.log_entry.status = status
        self.log_entry.completed_at = datetime.utcnow()
        self.log_entry.duration_ms = int((self.log_entry.completed_at - self.log_entry.started_at).total_seconds() * 1000)
        self.log_entry.records_processed = processed
        self.log_entry.records_updated = updated
        self.log_entry.records_failed = failed
        self.log_entry.error_message = error
        self.log_entry.source_version = version
        
        await self.db.commit()
