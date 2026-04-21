from sqlalchemy.ext.asyncio import create_async_engine
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5433/apex_f1"
engine = create_async_engine(DATABASE_URL, echo=True)