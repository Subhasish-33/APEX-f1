from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import asyncio
import os
import sys

# ── Load environment variables ────────────────────────────────────────────────
# Explicitly target apps/api/.env regardless of where alembic is invoked from.
_here = os.path.dirname(os.path.abspath(__file__))          # alembic/
_api_root = os.path.dirname(_here)                           # apps/api/
_repo_root = os.path.dirname(os.path.dirname(_api_root))     # apex-f1/

# Add repo root to sys.path so 'apps.api.models' can be imported
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Load .env from apps/api/ directory
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(_api_root, ".env"), override=True)
except ImportError:
    pass  # dotenv not installed; rely on shell environment variables

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set.\n"
        f"Make sure apps/api/.env exists and contains DATABASE_URL.\n"
        f"Looked in: {_api_root}"
    )

# ── Alembic config ─────────────────────────────────────────────────────────
config = context.config
# configparser uses % for interpolation — escape any literal % in the URL
# (e.g. %40 is URL-encoding for '@' in passwords)
_url_for_config = DATABASE_URL.replace("%", "%%")
config.set_main_option("sqlalchemy.url", _url_for_config)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from apps.api.models import Base
target_metadata = Base.metadata


# ── Migration runners ──────────────────────────────────────────────────────
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())