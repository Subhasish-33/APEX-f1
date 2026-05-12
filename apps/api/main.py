from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import drivers, circuits, races, search, seasons, intelligence
from database import engine, Base
from cache import init_redis
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="APEX-F1 API (Pass 3 Recovery)")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Keep it minimal for recovery
    try:
        await init_redis()
        logger.info("Redis cache initialized.")
    except Exception as e:
        logger.error(f"Redis initialization failed: {e}")

# Routers
app.include_router(drivers.router, tags=["Drivers"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(races.router, tags=["Races"])
app.include_router(search.router, tags=["Search"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(intelligence.router, tags=["Intelligence"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "APEX-F1 Recovery Mode"}

@app.get("/health")
async def health():
    return {"status": "ok"}