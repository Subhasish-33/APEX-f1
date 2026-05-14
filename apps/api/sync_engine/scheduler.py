import asyncio
import logging
from typing import List, Optional
from db import async_session
from sync_engine.executor import SyncExecutor
from sync_engine.registry import JobRegistry
from sync_engine.logger import SyncOperationalLogger

logger = logging.getLogger(__name__)

class SyncScheduler:
    """
    Temporal orchestrator for APEX-F1.
    Defines the 'Pulse' of the platform using AsyncSession.
    """
    
    def __init__(self):
        self.executor = SyncExecutor()

    async def run_sync_pulse(self, season: int, jobs: Optional[List[str]] = None):
        """
        Executes a synchronization cycle for a specific season.
        """
        target_jobs = jobs or JobRegistry.list_jobs()
        logger.info(f"🌀 Initializing Sync Pulse | Season: {season} | Jobs: {len(target_jobs)}")
        
        results = {}
        for job_name in target_jobs:
            job_cls = JobRegistry.get_job(job_name)
            
            # Execution with isolated tracking
            success = await self.executor.execute_job(
                job_cls, 
                season=season,
                endpoint=f"sync://{job_name}/{season}"
            )
            
            results[job_name] = success
            if not success:
                logger.warning(f"⚠️ Job {job_name} failed. Continuing pulse...")
            
            # Small cooldown between jobs to prevent upstream pressure
            await asyncio.sleep(1.0)
            
        logger.info(f"🏁 Sync Pulse Completed for Season {season}")
        return results

    async def run_integrity_sweep(self):
        """
        Background maintenance to check for staleness or reconciliation drift.
        """
        async with async_session() as db:
            op_logger = SyncOperationalLogger(db)
            # Logic to trigger re-sync if data is stale
            pass
