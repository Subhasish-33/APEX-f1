from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import get_settings
from db import engine
from models import Base
from routes import drivers, constructors, circuits, seasons, races, predictions, analytics, search

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

from ml.engine import InferenceEngine

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
async def root():
    return {
        "status": "ok",
        "service": "APEX-F1 API",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


app.include_router(drivers.router, tags=["Drivers"])
app.include_router(constructors.router, tags=["Constructors"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(races.router, tags=["Races"])
app.include_router(predictions.router)
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(search.router, tags=["Search"])