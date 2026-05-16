import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Load .env file explicitly so this works in all execution contexts
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Please configure it in apps/api/.env or as an environment variable. "
        "See apps/api/.env.example for reference."
    )

# Supabase (and most cloud PG providers) require SSL.
# asyncpg uses ssl="require" to enforce TLS without full cert verification.
# For local fallback (postgres://localhost), ssl will simply be ignored if the
# server doesn't advertise TLS.
# Supabase (and most cloud PG providers) require SSL.
_connect_args: dict = {
    "ssl": "require",
    "command_timeout": 60,
    "statement_cache_size": 0
}

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args=_connect_args
)

async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with async_session() as session:
        yield session