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
        self._locks: Dict[int, asyncio.Lock] = {}
        # Deterministic order: Foundation -> Results -> Derived Truth
        self.CORE_JOBS_ORDER = [
            "ingest_races",
            "ingest_results",
            "recompute_standings"
        ]

    def _get_lock(self, season: int) -> asyncio.Lock:
        if season not in self._locks:
            self._locks[season] = asyncio.Lock()
        return self._locks[season]

    async def run_sync_pulse(self, season: int, jobs: Optional[List[str]] = None):
        """
        Executes a synchronization cycle for a specific season.
        Includes a concurrency lock to prevent race conditions.
        """
        lock = self._get_lock(season)
        if lock.locked():
            logger.warning(f"🚫 Pulse Skip: Sync already in progress for Season {season}")
            return {"status": "skipped", "reason": "lock_active"}

        async with lock:
            # Determine order: provided list or canonical order + others
            all_available = JobRegistry.list_jobs()
            if jobs:
                target_jobs = jobs
            else:
                # Prioritize CORE_JOBS_ORDER, then append any remaining
                target_jobs = [j for j in self.CORE_JOBS_ORDER if j in all_available]
                target_jobs += [j for j in all_available if j not in self.CORE_JOBS_ORDER]

            logger.info(f"🌀 Initializing Sync Pulse | Season: {season} | Ordered Jobs: {target_jobs}")
            
            results = {}
            for job_name in target_jobs:
                job_cls = JobRegistry.get_job(job_name)
                
                success = await self.executor.execute_job(
                    job_cls, 
                    season=season,
                    endpoint=f"sync://{job_name}/{season}"
                )
                
                results[job_name] = success
                if not success:
                    logger.error(f"❌ Critical Failure in Pulse: {job_name}. Aborting sequence.")
                    break # Stop pulse on critical failure to preserve state integrity
                
                await asyncio.sleep(0.5)
                
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
