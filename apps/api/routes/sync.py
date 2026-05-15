from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta
from db import get_db
from models import SyncLog, Session, Race, SessionState, TelemetryState
from sync_engine.scheduler import SyncScheduler
from sync_engine.executor import SyncExecutor
from sync_engine.logger import SyncOperationalLogger

router = APIRouter(prefix="/sync", tags=["Platform Sync"])
scheduler = SyncScheduler()
executor = SyncExecutor() # Access the shared executor state if needed, though usually singleton-like

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
    """High-level health and staleness metrics."""
    op_logger = SyncOperationalLogger(db)
    stats = await op_logger.get_sync_stats(days=7)
    
    # Add Circuit Breaker status
    stats["circuit_breakers"] = executor._failure_counters
    return stats

@router.get("/diagnostics")
async def get_sync_diagnostics(db: AsyncSession = Depends(get_db)):
    """Deep operational diagnostics for live weekend state and telemetry freshness."""
    now = datetime.utcnow()
    
    # 1. Check for stale sessions
    session_stmt = select(Session).where(
        and_(
            Session.state == SessionState.GREEN_FLAG,
            Session.date < (now - timedelta(hours=4))
        )
    )
    res = await db.execute(session_stmt)
    stale_sessions = res.scalars().all()
    
    # 2. Check telemetry freshness
    race_stmt = select(Race).where(Race.telemetry_state == TelemetryState.AVAILABLE)
    res = await db.execute(race_stmt)
    active_telemetry_races = res.scalars().all()
    
    diagnostics = {
        "timestamp": now.isoformat(),
        "stale_sessions_count": len(stale_sessions),
        "active_telemetry_streams": len(active_telemetry_races),
        "circuit_breakers": executor._failure_counters,
        "issues": []
    }
    
    # Add Circuit Breaker issues
    for sync_type, failures in executor._failure_counters.items():
        if failures >= executor.FAILURE_THRESHOLD:
            diagnostics["issues"].append({
                "type": "CIRCUIT_BREAKER_TRIPPED",
                "message": f"Sync type {sync_type} is HALTED due to {failures} consecutive failures.",
                "severity": "CRITICAL"
            })
    
    if stale_sessions:
        diagnostics["issues"].append({
            "type": "STALE_SESSION",
            "message": f"Found {len(stale_sessions)} sessions stuck in GREEN_FLAG state.",
            "severity": "WARNING"
        })
        
    return diagnostics

@router.get("/failures")
async def get_sync_failures(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Retrieve recent synchronization failures."""
    op_logger = SyncOperationalLogger(db)
    failures = await op_logger.get_recent_failures(hours=24)
    return failures
