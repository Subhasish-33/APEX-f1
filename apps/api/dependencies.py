from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from apps.api.db import engine

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
