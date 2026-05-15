import time
from typing import Dict, Any, Optional
from .session_lifecycle import LifecycleState, SessionLifecycle
from .telemetry_tracker import TelemetryTracker

class SessionStateEngine:
    """
    The canonical source of live-session truth.
    Orchestrates the lifecycle, telemetry freshness, and state degradation.
    """
    def __init__(self):
        self.telemetry_tracker = TelemetryTracker(stale_threshold_seconds=15)
        # In a real running state, this would be updated by a background sync worker
        self._current_lifecycle = SessionLifecycle(
            state=LifecycleState.ARCHIVED,
            flag_color="NONE",
            laps_completed=0
        )
        self._last_telemetry_sync: float = 0

    def update_session_state(self, state: LifecycleState, flag: str, laps: int, last_sync: float):
        """Called by the ingestion worker when polling the provider."""
        self._current_lifecycle = SessionLifecycle(
            state=state,
            flag_color=flag,
            laps_completed=laps
        )
        self._last_telemetry_sync = last_sync

    def get_live_operational_context(self) -> Dict[str, Any]:
        """
        Returns the unified temporal awareness payload injected into 
        the ResponseEnvelope.state object during live requests.
        """
        telemetry_freshness = self.telemetry_tracker.evaluate_freshness(self._last_telemetry_sync)
        
        # Determine overall degraded state
        is_degraded = telemetry_freshness["degraded"]
        
        return {
            "session": {
                "active": self._current_lifecycle.is_active,
                "terminal": self._current_lifecycle.is_terminal,
                "lifecycle_state": self._current_lifecycle.state.value,
                "flag": self._current_lifecycle.flag_color,
                "laps_completed": self._current_lifecycle.laps_completed,
            },
            "telemetry": telemetry_freshness,
            "overall_degraded": is_degraded
        }
