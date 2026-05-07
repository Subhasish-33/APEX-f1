import json
import functools
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder

redis_client = Redis(host='localhost', port=6379, db=0, decode_responses=True)

def cached(ttl: int = 3600, key_prefix: str = ""):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            key_parts = [key_prefix] if key_prefix else [func.__name__]
            for arg in args:
                if isinstance(arg, (int, str, float, bool)):
                    key_parts.append(str(arg))
            for k, v in sorted(kwargs.items()):
                # Skip dependencies like session
                if k in ("session", "db") or not isinstance(v, (int, str, float, bool)):
                    continue
                key_parts.append(f"{k}:{v}")
            cache_key = ":".join(key_parts)
            
            # Check cache
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except Exception:
                pass # Fallback to DB if redis is down
                
            # Execute function
            result = await func(*args, **kwargs)
            
            # Serialize and store in cache
            try:
                data_to_cache = jsonable_encoder(result)
                await redis_client.set(cache_key, json.dumps(data_to_cache), ex=ttl)
            except Exception:
                pass # Ignore cache set errors
                
            return result
        return wrapper
    return decorator
