import logging
import traceback
from typing import Type, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sync_engine.base import BaseIngestionJob
from db import async_session

logger = logging.getLogger(__name__)

class SyncExecutor:
    """
    Orchestration engine for job lifecycles with built-in partial recovery and circuit breaking.
    Uses AsyncSession for all operations.
    """
    
    # Circuit Breaker state: Maps sync_type -> consecutive_failures
    _failure_counters: Dict[str, int] = {}
    FAILURE_THRESHOLD = 3

    async def execute_job(self, job_class: Type[BaseIngestionJob], endpoint: str, **kwargs) -> bool:
        """
        Executes a job through its full lifecycle: Start -> Run -> Audit -> End.
        Includes Circuit Breaker logic to halt execution if threshold is met.
        """
        sync_type = getattr(job_class, 'sync_type', 'UNKNOWN')
        
        # Check Circuit Breaker
        if self._failure_counters.get(sync_type, 0) >= self.FAILURE_THRESHOLD:
            logger.error(f"🚫 Circuit Breaker TRIP: Halting {sync_type} due to repeated failures.")
            return False

        async with async_session() as db:
            job = job_class(db)
            await job.start_sync(endpoint)
            
            try:
                # 1. Run the ingestion
                logger.info(f"🚀 Executing Job: {job.provider} | {job.sync_type}")
                results = await job.run(**kwargs)
                
                # 2. Audit the results
                is_valid = await job.audit()
                if not is_valid:
                    raise ValueError(f"Integrity audit failed for {job.provider}")
                
                # 3. Finalize
                await job.end_sync(
                    status="COMPLETED",
                    processed=results.get("processed", 0),
                    updated=results.get("updated", 0),
                    failed=results.get("failed", 0),
                    version=results.get("version")
                )
                
                # Reset counter on success
                self._failure_counters[sync_type] = 0
                return True

            except Exception as e:
                error_msg = f"{str(e)}\n{traceback.format_exc()}"
                logger.error(f"❌ Job Failed: {job.provider} | Error: {str(e)}")
                
                # Increment failure counter
                self._failure_counters[sync_type] = self._failure_counters.get(sync_type, 0) + 1
                
                # Trigger rollback if implemented
                try:
                    await job.rollback()
                except Exception as rb_e:
                    logger.error(f"⚠️ Rollback also failed for {job.provider}: {str(rb_e)}")
                
                await job.end_sync(
                    status="FAILED",
                    error=error_msg
                )
                return False

    async def execute_batch(self, job_classes: List[Type[BaseIngestionJob]], **kwargs) -> Dict[str, bool]:
        """
        Executes a batch of jobs with partial recovery logic.
        """
        results = {}
        for job_cls in job_classes:
            endpoint = kwargs.get("endpoint", f"sync://{job_cls.__name__}")
            success = await self.execute_job(job_cls, endpoint=endpoint, **kwargs)
            results[job_cls.__name__] = success
        return results
