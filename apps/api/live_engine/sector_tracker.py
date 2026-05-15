from typing import Dict, Any, List

class SectorTracker:
    """
    Tracks sector progression, purple sectors, and personal bests.
    Ensures incomplete laps do not corrupt canonical timing.
    """
    @staticmethod
    def identify_purple_sectors(drivers_sectors: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        Expects a list of dictionaries containing s1, s2, s3 times.
        Returns a dictionary mapping 's1', 's2', 's3' to the driver_ref that holds the overall best time.
        """
        best_sectors = {
            "s1": {"time": float('inf'), "driver": None},
            "s2": {"time": float('inf'), "driver": None},
            "s3": {"time": float('inf'), "driver": None},
        }

        for driver in drivers_sectors:
            ref = driver.get("driver_ref")
            for sector in ["s1", "s2", "s3"]:
                time = driver.get(sector)
                if time and time < best_sectors[sector]["time"]:
                    best_sectors[sector] = {"time": time, "driver": ref}

        return {
            "s1_purple": best_sectors["s1"]["driver"],
            "s2_purple": best_sectors["s2"]["driver"],
            "s3_purple": best_sectors["s3"]["driver"]
        }
