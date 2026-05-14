import logging
import traceback
from typing import Type, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sync_engine.base import BaseIngestionJob
from db import async_session

logger = logging.getLogger(__name__)

class SyncExecutor:
    """
    Orchestration engine for job lifecycles with built-in partial recovery.
    Uses AsyncSession for all operations.
    """
    
    async def execute_job(self, job_class: Type[BaseIngestionJob], endpoint: str, **kwargs) -> bool:
        """
        Executes a job through its full lifecycle: Start -> Run -> Audit -> End.
        """
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
                return True

            except Exception as e:
                error_msg = f"{str(e)}\n{traceback.format_exc()}"
                logger.error(f"❌ Job Failed: {job.provider} | Error: {str(e)}")
                
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
