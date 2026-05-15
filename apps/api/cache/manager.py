import os
import json
import time
import asyncio
import logging
from typing import Any, Callable, Dict, Tuple, Optional
from dotenv import load_dotenv
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder

from .metrics import metrics
from .policy import CacheTier, get_ttl_for_tier, get_stale_threshold

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)
logger = logging.getLogger("cache_manager")

class CacheManager:
    """
    Centralized Cache Orchestrator providing:
    - Stale-While-Revalidate semantics
    - Temporal freshness preservation
    - Fail-soft fallback to canonical DB
    """
    @classmethod
    async def get_or_compute(
        cls, 
        key: str, 
        compute_func: Callable, 
        tier: CacheTier
    ) -> Any:
        try:
            cached_payload = await redis_client.get(key)
        except Exception as e:
            logger.error(f"Redis Outage: {e}. Falling back to canonical truth.")
            metrics.record_redis_failure()
            return await compute_func() # Fail-soft: execute cold path

        now = time.time()
        
        if cached_payload:
            payload = json.loads(cached_payload)
            cached_at = payload.get("__cached_at", 0)
            data = payload.get("data")
            
            ttl = get_ttl_for_tier(tier)
            stale_threshold = get_stale_threshold(tier)
            age = now - cached_at

            if age < ttl:
                # Fresh cache hit
                metrics.record_hit()
                return data
            
            elif age < stale_threshold:
                # Stale cache hit -> Stale-While-Revalidate
                metrics.record_stale_return()
                
                # Trigger async background revalidation without blocking
                asyncio.create_task(cls._revalidate_in_background(key, compute_func, tier))
                
                # We inject an explicit degraded operational state if data is an envelope
                if isinstance(data, dict) and "state" in data:
                    data["state"]["freshness"] = "STALE"
                    data["state"]["degraded"] = True
                return data

        # Cache Miss (or expired beyond stale threshold)
        metrics.record_miss()
        return await cls._execute_and_cache(key, compute_func, tier)

    @classmethod
    async def _revalidate_in_background(cls, key: str, compute_func: Callable, tier: CacheTier):
        try:
            metrics.record_revalidation()
            await cls._execute_and_cache(key, compute_func, tier)
        except Exception as e:
            logger.error(f"Background revalidation failed for {key}: {e}")

    @classmethod
    async def _execute_and_cache(cls, key: str, compute_func: Callable, tier: CacheTier) -> Any:
        result = await compute_func()
        
        try:
            payload = {
                "__cached_at": time.time(),
                "data": jsonable_encoder(result)
            }
            # We set the Redis TTL to the stale threshold to automatically purge it when it's completely useless
            stale_threshold = get_stale_threshold(tier)
            await redis_client.set(key, json.dumps(payload), ex=stale_threshold)
        except Exception as e:
            metrics.record_redis_failure()
            logger.error(f"Failed to write cache for {key}: {e}")
            
        return result
