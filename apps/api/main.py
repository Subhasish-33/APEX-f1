from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    drivers, 
    circuits, 
    races, 
    search, 
    seasons, 
    analytics, 
    constructors, 
    predictions, 
    standings,
    health,
    sync,
    live
)
from db import engine
from models import Base
from cache import redis_client
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from core.exceptions import ApexException, apex_exception_handler, global_exception_handler

app = FastAPI(title="APEX-F1 API (Production Hardened)")

# Register Exception Handlers
app.add_exception_handler(ApexException, apex_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

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
    logger.info("APEX-F1 API Starting Up...")
    # Redis is lazily initialized on first use by redis_client

# Routers
app.include_router(drivers.router, tags=["Drivers"])
app.include_router(constructors.router, tags=["Constructors"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(races.router, tags=["Races"])
app.include_router(search.router, tags=["Search"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(predictions.router, tags=["Predictions"])
app.include_router(standings.router, tags=["Standings"])
app.include_router(sync.router, tags=["Platform Sync"])
app.include_router(health.router, tags=["Platform Health"])
app.include_router(live.router, prefix="/live", tags=["Live Session"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "APEX-F1 API"}