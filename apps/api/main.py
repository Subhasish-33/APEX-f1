from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from apps.api.config import get_settings
from apps.api.db import engine
from apps.api.models import Base
from apps.api.routes import drivers, constructors, circuits, seasons, races, predictions, analytics, search

settings = get_settings()

app = FastAPI(
    title="Apex F1 API",
    version="2.0.0",
    description="Formula 1 Intelligence Platform — FastAPI backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from apps.api.ml.engine import InferenceEngine

_model_loaded = False

@app.on_event("startup")
async def startup():
    global _model_loaded
    # Validate environment on startup — fails fast if misconfigured
    settings = get_settings()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize the ML Inference Engine
    try:
        app.state.inference_engine = InferenceEngine()
        app.state.inference_engine.initialize()
        _model_loaded = True
    except Exception as e:
        # Model failure is non-fatal — API still serves data endpoints
        _model_loaded = False
        import structlog
        log = structlog.get_logger()
        log.warning("ml_model_load_failed", error=str(e))


@app.get("/")
def root():
    return {"message": "Apex F1 API", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    """
    Full verification matrix for Railway health checks and CI.
    Returns db_connected, redis_connected, model_loaded, version, environment.
    """
    db_ok = False
    redis_ok = False

    # DB check
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    # Redis check
    try:
        from apps.api.cache import get_redis
        r = await get_redis()
        await r.ping()
        redis_ok = True
    except Exception:
        pass

    all_ok = db_ok and redis_ok

    return {
        "status": "healthy" if all_ok else "degraded",
        "db_connected": db_ok,
        "redis_connected": redis_ok,
        "model_loaded": _model_loaded,
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
    }


app.include_router(drivers.router, tags=["Drivers"])
app.include_router(constructors.router, tags=["Constructors"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(races.router, tags=["Races"])
app.include_router(predictions.router)
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(search.router, tags=["Search"])