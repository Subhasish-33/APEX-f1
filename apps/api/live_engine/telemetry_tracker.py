import time
from typing import Dict, Any

class TelemetryTracker:
    """
    Tracks telemetry freshness and enforces degradation semantics 
    if providers drop or synchronization falls behind.
    """
    def __init__(self, stale_threshold_seconds: int = 15):
        self.stale_threshold_seconds = stale_threshold_seconds

    def evaluate_freshness(self, last_sync_time: float) -> Dict[str, Any]:
        """
        Determines the temporal truth of the telemetry payload.
        Returns a state dictionary for the Canonical Response Envelope.
        """
        now = time.time()
        age = now - last_sync_time
        
        if age < self.stale_threshold_seconds:
            return {
                "freshness": "LIVE",
                "degraded": False,
                "latency_sec": round(age, 2)
            }
        elif age < (self.stale_threshold_seconds * 4):
            # Telemetry is lagging but hasn't completely failed
            return {
                "freshness": "STALE",
                "degraded": True,
                "latency_sec": round(age, 2),
                "reason": "PROVIDER_LAG"
            }
        else:
            # Telemetry is dead or we are looking at an archived session
            return {
                "freshness": "HISTORICAL",
                "degraded": True,
                "latency_sec": round(age, 2),
                "reason": "NO_RECENT_TELEMETRY"
            }
