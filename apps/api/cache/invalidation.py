import logging
from .manager import redis_client
from .metrics import metrics

logger = logging.getLogger("cache_invalidation")

async def invalidate_key(key: str):
    """Manually invalidate a specific cache key."""
    try:
        await redis_client.delete(key)
        logger.info(f"Invalidated key: {key}")
    except Exception as e:
        metrics.record_redis_failure()
        logger.error(f"Failed to invalidate key {key}: {e}")

async def invalidate_domain(domain: str):
    """
    Invalidate an entire domain namespace.
    Example: invalidate_domain("standings") clears apex:standings:*
    """
    prefix = f"apex:{domain}:*"
    try:
        keys = await redis_client.keys(prefix)
        if keys:
            await redis_client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} keys in domain '{domain}'")
    except Exception as e:
        metrics.record_redis_failure()
        logger.error(f"Failed to invalidate domain {domain}: {e}")
