import os
import json
import functools
from dotenv import load_dotenv
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Redis.from_url() handles both:
#   redis://localhost:6379/0      — local (no TLS)
#   rediss://:<token>@host:port   — Upstash (TLS enforced)
# This means the same code works in all environments with zero changes.
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


def cached(ttl: int = 3600, key_prefix: str = ""):
    """
    Async cache decorator backed by Redis / Upstash.
    Falls back gracefully to the DB if Redis is unavailable.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build a deterministic cache key
            key_parts = [key_prefix] if key_prefix else [func.__name__]
            for arg in args:
                if isinstance(arg, (int, str, float, bool)):
                    key_parts.append(str(arg))
            for k, v in sorted(kwargs.items()):
                if k in ("session", "db") or not isinstance(v, (int, str, float, bool)):
                    continue
                key_parts.append(f"{k}:{v}")
            cache_key = ":".join(key_parts)

            # Try reading from cache
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except Exception:
                pass  # Gracefully degrade — hit DB if Redis is unavailable

            # Execute the underlying function
            result = await func(*args, **kwargs)

            # Persist to cache
            try:
                data_to_cache = jsonable_encoder(result)
                await redis_client.set(cache_key, json.dumps(data_to_cache), ex=ttl)
            except Exception:
                pass  # Never let a cache write failure break the response

            return result
        return wrapper
    return decorator


async def invalidate(key: str):
    """Manually invalidate a specific cache key."""
    try:
        await redis_client.delete(key)
    except Exception:
        pass


async def flush_prefix(prefix: str):
    """Invalidate all cache keys matching a prefix pattern."""
    try:
        keys = await redis_client.keys(f"{prefix}*")
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass
