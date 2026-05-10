"""
Centralized configuration for the APEX F1 API.

All environment variables are declared here via pydantic-settings.
The app MUST fail fast on startup if required variables are missing.

Usage:
    from config import get_settings
    settings = get_settings()
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Required — app will not start without these ────────────────────────
    DATABASE_URL: str
    REDIS_URL: str

    # ── Optional with defaults ─────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    API_VERSION: str = "2.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns the cached Settings singleton.
    On first call, validates all env vars — raises ValidationError if any
    required variable is missing, which crashes the app at startup (fail-fast).
    """
    return Settings()
