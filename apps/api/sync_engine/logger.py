import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import SyncLog

logger = logging.getLogger(__name__)

class SyncOperationalLogger:
    """
    Visibility layer for synchronization health and performance using AsyncSession.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recent_failures(self, hours: int = 24) -> List[SyncLog]:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        stmt = select(SyncLog).where(
            SyncLog.status == "FAILED",
            SyncLog.started_at >= cutoff
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_sync_stats(self, days: int = 7) -> Dict[str, Any]:
        cutoff = datetime.utcnow() - timedelta(days=days)
        stmt = select(SyncLog).where(SyncLog.started_at >= cutoff)
        result = await self.db.execute(stmt)
        logs = result.scalars().all()
        
        stats = {
            "total_syncs": len(logs),
            "completed": len([l for l in logs if l.status == "COMPLETED"]),
            "failed": len([l for l in logs if l.status == "FAILED"]),
            "avg_duration_ms": sum([l.duration_ms for l in logs if l.duration_ms]) / len(logs) if logs else 0,
            "provider_breakdown": {}
        }
        
        for log in logs:
            if log.provider not in stats["provider_breakdown"]:
                stats["provider_breakdown"][log.provider] = {"success": 0, "fail": 0}
            
            if log.status == "COMPLETED":
                stats["provider_breakdown"][log.provider]["success"] += 1
            else:
                stats["provider_breakdown"][log.provider]["fail"] += 1
                
        return stats

    async def check_staleness(self, provider: str, sync_type: str, threshold_hours: int = 12) -> bool:
        """
        Returns True if the last successful sync for this type was longer ago than threshold.
        """
        stmt = select(SyncLog).where(
            SyncLog.provider == provider,
            SyncLog.sync_type == sync_type,
            SyncLog.status == "COMPLETED"
        ).order_by(SyncLog.completed_at.desc()).limit(1)
        
        result = await self.db.execute(stmt)
        last_success = result.scalar_one_or_none()
        
        if not last_success:
            return True
            
        return (datetime.utcnow() - last_success.completed_at).total_seconds() > (threshold_hours * 3600)
