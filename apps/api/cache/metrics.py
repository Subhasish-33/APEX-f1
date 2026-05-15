import logging

logger = logging.getLogger("cache_metrics")

class CacheMetrics:
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.stale_returns = 0
        self.revalidations = 0
        self.redis_failures = 0

    def record_hit(self):
        self.hits += 1

    def record_miss(self):
        self.misses += 1

    def record_stale_return(self):
        self.stale_returns += 1

    def record_revalidation(self):
        self.revalidations += 1

    def record_redis_failure(self):
        self.redis_failures += 1

    def get_diagnostics(self) -> dict:
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "hit_rate_pct": round(hit_rate, 2),
            "total_hits": self.hits,
            "total_misses": self.misses,
            "stale_returns": self.stale_returns,
            "revalidations": self.revalidations,
            "redis_failures": self.redis_failures
        }

# Global singleton for observational metrics
metrics = CacheMetrics()
