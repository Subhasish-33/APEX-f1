from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_db
from sync_engine.scheduler import SyncScheduler
from sync_engine.logger import SyncOperationalLogger

router = APIRouter(prefix="/sync", tags=["Platform Sync"])
scheduler = SyncScheduler()

@router.post("/pulse/{season}")
async def trigger_sync_pulse(season: int, background_tasks: BackgroundTasks):
    """
    Triggers a full synchronization pulse for a specific season.
    Runs in the background to avoid blocking.
    """
    background_tasks.add_task(scheduler.run_sync_pulse, season=season)
    return {"status": "accepted", "message": f"Sync pulse for season {season} started in background."}

@router.get("/health")
async def get_sync_health(db: AsyncSession = Depends(get_db)):
    """
    Returns high-level health metrics for the synchronization engine.
    """
    op_logger = SyncOperationalLogger(db)
    stats = await op_logger.get_sync_stats(days=7)
    return stats

@router.get("/failures")
async def get_recent_failures(db: AsyncSession = Depends(get_db)):
    """
    Returns recent synchronization failures.
    """
    op_logger = SyncOperationalLogger(db)
    failures = await op_logger.get_recent_failures(hours=24)
    return failures
