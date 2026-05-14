import asyncio
import logging
from typing import Callable, Any
from functools import wraps

logger = logging.getLogger(__name__)

class SyncRetry:
    """
    Centralized governance for retries, backoffs, and provider pacing.
    """
    
    def __init__(self, max_retries: int = 3, initial_delay: float = 1.0, factor: float = 2.0):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.factor = factor

    @staticmethod
    def exponential_backoff(max_retries: int = 3, base_delay: float = 1.0):
        """
        Decorator for adding exponential backoff to any async function.
        """
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                retries = 0
                delay = base_delay
                while retries <= max_retries:
                    try:
                        return await func(*args, **kwargs)
                    except Exception as e:
                        retries += 1
                        if retries > max_retries:
                            logger.error(f"⚠️ Max retries ({max_retries}) reached for {func.__name__}. Last error: {str(e)}")
                            raise e
                        
                        logger.warning(f"🔄 Retry {retries}/{max_retries} for {func.__name__} after {delay}s. Error: {str(e)}")
                        await asyncio.sleep(delay)
                        delay *= 2
            return wrapper
        return decorator

    @staticmethod
    async def pace_provider(provider_name: str, delay: float = 0.5):
        """
        Enforces a cooldown period between requests to a specific provider.
        """
        logger.debug(f"⏳ Pacing provider {provider_name} for {delay}s")
        await asyncio.sleep(delay)
