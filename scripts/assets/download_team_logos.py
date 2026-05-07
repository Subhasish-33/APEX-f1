import asyncio
import aiohttp
from pathlib import Path
import structlog
import json

logger = structlog.get_logger()

OUTPUT_DIR = Path("apps/web/public/assets/teams")
REGISTRY_FILE = OUTPUT_DIR / "registry.json"

# Source mapping for SVG logos
TEAM_LOGO_SOURCES = {
    "ferrari": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/512px-Ferrari-Logo.svg.png", # Fallback to PNG for simple DL
    "red_bull": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Red_Bull_Racing_logo.svg/512px-Red_Bull_Racing_logo.svg.png",
    "mercedes": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/512px-Mercedes-Logo.svg.png",
    "mclaren": "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/512px-McLaren_Racing_logo.svg.png",
    "alpine": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Alpine_F1_Team_logo.svg/512px-Alpine_F1_Team_logo.svg.png",
}

async def download_logo(session, id, url):
    output_path = OUTPUT_DIR / f"{id}.png"
    if output_path.exists():
        return
    
    async with session.get(url) as response:
        if response.status == 200:
            data = await response.read()
            with open(output_path, "wb") as f:
                f.write(data)
            logger.info("Team logo downloaded", id=id)

async def main():
    logger.info("🚀 Starting Team Logo Ingestion...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with aiohttp.ClientSession() as session:
        tasks = [download_logo(session, id, url) for id, url in TEAM_LOGO_SOURCES.items()]
        await asyncio.gather(*tasks)
        
    # Build registry
    registry = {id: f"/assets/teams/{id}.png" for id in TEAM_LOGO_SOURCES.keys()}
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=2)
        
    logger.info("✅ Team Logo Ingestion Complete")

if __name__ == "__main__":
    asyncio.run(main())
