from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import drivers, circuits, races, search, seasons, intelligence
from database import engine, Base
from cache import init_redis, get_redis
from ml.engine import inference_engine
from sqlalchemy import text
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="APEX-F1 API")

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
    # Verify DB connectivity
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            logger.info("Database connection verified.")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

    # Initialize Redis
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
    return {
        "status": "ok",
        "service": "APEX-F1 API",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Comprehensive verification matrix.
    """
    db_ok = False
    redis_ok = False
    
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except: pass
    
    try:
        r = await get_redis()
        await r.ping()
        redis_ok = True
    except: pass
    
    all_ok = db_ok and redis_ok
    
    return {
        "status": "healthy" if all_ok else "degraded",
        "database": db_ok,
        "redis": redis_ok,
        "ml_engine": "lazy-loaded"
    }