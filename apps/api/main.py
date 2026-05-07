from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from apps.api.db import engine
from apps.api.models import Base
from apps.api.routes import drivers, constructors, circuits, seasons, races, predictions

app = FastAPI(title="Apex F1 API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def root():
    return {"message": "Apex F1 API running 🚀"}

@app.get("/health")
async def health_check():
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "healthy"}

app.include_router(drivers.router, tags=["Drivers"])
app.include_router(constructors.router, tags=["Constructors"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(races.router, tags=["Races"])
app.include_router(predictions.router)