import functools
from typing import Callable, Any

from .manager import CacheManager, redis_client
from .keys import generate_cache_key
from .policy import CacheTier
from .metrics import metrics
from .invalidation import invalidate_key, invalidate_domain

def governed_cache(domain: str, tier: CacheTier):
    """
    Governed async cache decorator using Stale-While-Revalidate semantics.
    Replaces the legacy, ungoverned `@cached` decorator.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract identifiers from kwargs (e.g. ref, id, season, page, limit)
            # and ignore session/db objects.
            clean_kwargs = {k: v for k, v in kwargs.items() if k not in ("session", "db") and isinstance(v, (int, str, float, bool))}
            
            # Use the first string/int arg as an identifier if no kwargs present
            identifier = None
            if args and isinstance(args[0], (int, str)):
                identifier = str(args[0])
                
            cache_key = generate_cache_key(domain, identifier, **clean_kwargs)
            
            # The compute function MUST return a serializable dict/envelope
            async def compute():
                return await func(*args, **kwargs)
                
            return await CacheManager.get_or_compute(cache_key, compute, tier)
            
        return wrapper
    return decorator

# Provide a legacy shim so routes don't instantly break before we migrate them
def cached(ttl: int = 3600, key_prefix: str = ""):
    import warnings
    warnings.warn("Legacy @cached is deprecated. Use @governed_cache.", DeprecationWarning)
    # Map to governed cache; guess the domain and tier
    tier = CacheTier.STATIC if ttl > 3600 else CacheTier.WARM
    domain = key_prefix if key_prefix else "legacy"
    return governed_cache(domain=domain, tier=tier)
