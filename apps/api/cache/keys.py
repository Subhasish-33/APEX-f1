import hashlib
from typing import Any, Dict

def generate_cache_key(domain: str, identifier: str = None, **kwargs) -> str:
    """
    Deterministic key generation.
    Format: apex:{domain}:{identifier}:{hash_of_kwargs}
    """
    key_parts = [f"apex", domain]
    
    if identifier:
        key_parts.append(str(identifier))
        
    if kwargs:
        # Sort kwargs to ensure deterministic hashing
        sorted_items = sorted([(k, str(v)) for k, v in kwargs.items() if v is not None])
        query_string = "&".join(f"{k}={v}" for k, v in sorted_items)
        if query_string:
            query_hash = hashlib.md5(query_string.encode()).hexdigest()[:8]
            key_parts.append(query_hash)
            
    return ":".join(key_parts)
