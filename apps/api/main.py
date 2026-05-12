from fastapi import FastAPI
from routes import drivers, circuits, races, search, seasons, intelligence

app = FastAPI(title="APEX-F1 API")

# Reintroducing Routers (Isolation Pass 1)
app.include_router(drivers.router, tags=["Drivers"])
app.include_router(circuits.router, tags=["Circuits"])
app.include_router(races.router, tags=["Races"])
app.include_router(search.router, tags=["Search"])
app.include_router(seasons.router, tags=["Seasons"])
app.include_router(intelligence.router, tags=["Intelligence"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "APEX-F1 API"}

@app.get("/health")
async def health():
    return {"status": "ok"}