from fastapi import FastAPI
from .db import engine
from .models import Base

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

from sqlalchemy import text

@app.get("/test-db")
async def test_db():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        return {"status": "connected"}

@app.get("/")
def root():
    return {"message": "API working"}