from enum import Enum

class CacheTier(Enum):
    STATIC = "STATIC"   # Editorial, bios, historical metadata (Long TTL)
    WARM = "WARM"       # Standings, schedules, race metadata (Medium TTL)
    HOT = "HOT"         # Live session state, leaderboard, intervals (Short TTL)

def get_ttl_for_tier(tier: CacheTier) -> int:
    """Returns TTL in seconds based on governed operational tier."""
    if tier == CacheTier.STATIC:
        return 86400  # 24 hours
    elif tier == CacheTier.WARM:
        return 300    # 5 minutes
    elif tier == CacheTier.HOT:
        return 10     # 10 seconds
    return 60         # Default fallback

def get_stale_threshold(tier: CacheTier) -> int:
    """Returns the acceptable stale window (seconds) during stale-while-revalidate."""
    if tier == CacheTier.STATIC:
        return 604800 # 7 days
    elif tier == CacheTier.WARM:
        return 3600   # 1 hour
    elif tier == CacheTier.HOT:
        return 60     # 1 minute
    return 300        # Default fallback
