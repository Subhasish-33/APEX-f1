from typing import List, Dict, Any

class IntervalTracker:
    """
    Computes provisional live intervals, gaps to leader, and position deltas.
    """
    @staticmethod
    def compute_leaderboard_gaps(drivers_telemetry: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Expects a list of dictionaries with 'driver_ref', 'position', 'total_time_ms', 'status'.
        Returns augmented leaderboard with 'gap_to_leader' and 'interval'.
        """
        if not drivers_telemetry:
            return []

        # Sort by position
        sorted_drivers = sorted(drivers_telemetry, key=lambda d: d.get("position", 999))
        leader = sorted_drivers[0]
        leader_time = leader.get("total_time_ms", 0)

        augmented = []
        for i, driver in enumerate(sorted_drivers):
            driver_time = driver.get("total_time_ms", 0)
            status = driver.get("status", "ON_TRACK")

            gap_to_leader = "LEADER"
            interval = "LEADER"

            if i > 0 and status == "ON_TRACK":
                prev_driver = sorted_drivers[i - 1]
                prev_time = prev_driver.get("total_time_ms", 0)
                
                if driver_time and leader_time:
                    gap_ms = driver_time - leader_time
                    gap_to_leader = f"+{round(gap_ms / 1000, 3)}s"
                
                if driver_time and prev_time:
                    int_ms = driver_time - prev_time
                    interval = f"+{round(int_ms / 1000, 3)}s"
            elif status != "ON_TRACK":
                gap_to_leader = status
                interval = status

            augmented.append({
                **driver,
                "gap_to_leader": gap_to_leader,
                "interval": interval
            })

        return augmented
