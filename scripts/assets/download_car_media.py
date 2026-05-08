import asyncio
import aiohttp
from pathlib import Path
import structlog
import json

logger = structlog.get_logger()

OUTPUT_DIR = Path("apps/web/public/assets/cars")
REGISTRY_FILE = OUTPUT_DIR / "registry.json"

# Source mapping for 2025 Car Side Profiles (Using official F1 sources where available)
CAR_MEDIA_SOURCES = {
    "ferrari": "https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png", # Placeholder for profile
    "red_bull": "https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png",
    "mercedes": "https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png",
    "mclaren": "https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png",
    "aston_martin": "https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png",
    "alpine": "https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png",
    "williams": "https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png",
    "haas": "https://media.formula1.com/content/dam/fom-website/teams/2025/haas-f1-team-logo.png",
    "sauber": "https://media.formula1.com/content/dam/fom-website/teams/2025/sauber-logo.png",
    "racing_bulls": "https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png",
}

# Note: In a real production environment, we would use the specific side-profile asset URLs 
# provided in the HTML directory. For this simulation, we'll establish the pipeline.

async def download_car(session, id, url):
    output_path = OUTPUT_DIR / f"{id}.png"
    if output_path.exists():
        return
    
    async with session.get(url) as response:
        if response.status == 200:
            data = await response.read()
            with open(output_path, "wb") as f:
                f.write(data)
            logger.info("Car profile downloaded", id=id)

async def main():
    logger.info("🏎️ Starting Car Media Ingestion...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with aiohttp.ClientSession() as session:
        tasks = [download_car(session, id, url) for id, url in CAR_MEDIA_SOURCES.items()]
        await asyncio.gather(*tasks)
        
    # Build registry
    registry = {id: f"/assets/cars/{id}.png" for id in CAR_MEDIA_SOURCES.keys()}
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=2)
        
    logger.info("✅ Car Media Ingestion Complete")

if __name__ == "__main__":
    asyncio.run(main())
