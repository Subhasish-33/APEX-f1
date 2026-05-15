from .session_lifecycle import LifecycleState

class PollingScheduler:
    """
    Governs the polling cadence of live systems based on the session lifecycle.
    Prevents aggressive DB/Provider pressure during non-critical states.
    """
    @staticmethod
    def get_recommended_polling_interval(state: LifecycleState, data_domain: str) -> int:
        """Returns recommended polling interval in seconds."""
        
        if state in [LifecycleState.SCHEDULED, LifecycleState.COMPLETED, LifecycleState.ARCHIVED]:
            # Static or very slow polling
            return 3600 if data_domain != "session_state" else 300
            
        elif state == LifecycleState.RED_FLAG or state == LifecycleState.PAUSED:
            # Slower polling during stoppages
            if data_domain == "leaderboard": return 30
            if data_domain == "session_state": return 15
            if data_domain == "telemetry": return 60
            
        elif state in [LifecycleState.GREEN_FLAG, LifecycleState.FORMATION_LAP, LifecycleState.YELLOW_FLAG, LifecycleState.SAFETY_CAR, LifecycleState.VIRTUAL_SAFETY_CAR]:
            # Fast polling for active racing
            if data_domain == "leaderboard": return 5
            if data_domain == "intervals": return 5
            if data_domain == "session_state": return 5
            if data_domain == "telemetry": return 5
            if data_domain == "tire_state": return 15
            if data_domain == "weather": return 30
            
        # Default fallback
        return 60
