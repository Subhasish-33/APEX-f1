from typing import Dict, Type, List
from sync_engine.base import BaseIngestionJob

class JobRegistry:
    """
    Central registry for all synchronization jobs.
    Enables dynamic discovery and orchestration.
    """
    _jobs: Dict[str, Type[BaseIngestionJob]] = {}

    @classmethod
    def register(cls, name: str):
        def wrapper(job_cls: Type[BaseIngestionJob]):
            cls._jobs[name] = job_cls
            return job_cls
        return wrapper

    @classmethod
    def get_job(cls, name: str) -> Type[BaseIngestionJob]:
        if name not in cls._jobs:
            raise ValueError(f"Job '{name}' not found in registry.")
        return cls._jobs[name]

    @classmethod
    def list_jobs(cls) -> List[str]:
        return list(cls._jobs.keys())
