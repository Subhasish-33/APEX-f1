import asyncio
import aiohttp
import aiofiles
from PIL import Image
import io
import os
import json
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog
from pathlib import Path

logger = structlog.get_logger()

# Constants
OUTPUT_DIR = Path("apps/web/public/assets/drivers")
REGISTRY_FILE = OUTPUT_DIR / "registry.json"

# Naming convention: https://media.formula1.com/content/dam/fom-website/drivers/[FirstInitial]/[DriverID]_[FirstName]_[LastName]/[driverid].png.transform/9col/image.png
DRIVER_ROSTER = [
    {"ref": "verstappen", "id": "MAXVER01", "first": "Max", "last": "Verstappen"},
    {"ref": "hamilton", "id": "LEWHAM01", "first": "Lewis", "last": "Hamilton"},
    {"ref": "leclerc", "id": "CHALEC01", "first": "Charles", "last": "Leclerc"},
    {"ref": "russell", "id": "GEORUS01", "first": "George", "last": "Russell"},
    {"ref": "norris", "id": "LANNOR01", "first": "Lando", "last": "Norris"},
    {"ref": "piastri", "id": "OSCPIA01", "first": "Oscar", "last": "Piastri"},
    {"ref": "alonso", "id": "FERALO01", "first": "Fernando", "last": "Alonso"},
    {"ref": "stroll", "id": "LANSTR01", "first": "Lance", "last": "Stroll"},
    {"ref": "gasly", "id": "PIEGAS01", "first": "Pierre", "last": "Gasly"},
    {"ref": "ocon", "id": "ESTOCO01", "first": "Esteban", "last": "Ocon"},
    {"ref": "albon", "id": "ALEALB01", "first": "Alexander", "last": "Albon"},
    {"ref": "tsunoda", "id": "YUKTSU01", "first": "Yuki", "last": "Tsunoda"},
    {"ref": "ricciardo", "id": "DANRIC01", "first": "Daniel", "last": "Ricciardo"},
    {"ref": "hulkenberg", "id": "NICHUL01", "first": "Nico", "last": "Hulkenberg"},
    {"ref": "bottas", "id": "VALBOT01", "first": "Valtteri", "last": "Bottas"},
    {"ref": "zhou", "id": "GUAZHO01", "first": "Guanyu", "last": "Zhou"},
    {"ref": "kevin_magnussen", "id": "KEVMAG01", "first": "Kevin", "last": "Magnussen"},
    {"ref": "sainz", "id": "CARSAI01", "first": "Carlos", "last": "Sainz"},
    {"ref": "perez", "id": "SERPER01", "first": "Sergio", "last": "Perez"},
    {"ref": "bearman", "id": "OLLBEA01", "first": "Oliver", "last": "Bearman"},
    {"ref": "antonelli", "id": "KIMANT01", "first": "Kimi", "last": "Antonelli"},
    {"ref": "doohan", "id": "JACDOO01", "first": "Jack", "last": "Doohan"},
    {"ref": "bortoleto", "id": "GABBOR01", "first": "Gabriel", "last": "Bortoleto"},
    {"ref": "colapinto", "id": "FRACOL01", "first": "Franco", "last": "Colapinto"},
]

def optimize_image(data: bytes, output_path: Path):
    """Convert image to WebP and resize."""
    try:
        img = Image.open(io.BytesIO(data))
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Resize to high-quality portrait
        img.thumbnail((800, 800))
        img.save(output_path, "WEBP", quality=95)
        return True
    except Exception as e:
        logger.error("Optimization failed", error=str(e))
        return False

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def download_driver(session: aiohttp.ClientSession, driver: dict):
    """Download and process a single driver headshot."""
    ref = driver["ref"]
    d_id = driver["id"]
    first = driver["first"]
    last = driver["last"]
    initial = first[0].upper()
    
    # Construct CDN URL
    url = f"https://media.formula1.com/content/dam/fom-website/drivers/{initial}/{d_id}_{first}_{last}/{d_id.lower()}.png.transform/9col/image.png"
    output_path = OUTPUT_DIR / f"{ref}.webp"
    
    async with session.get(url) as response:
        if response.status == 200:
            data = await response.read()
            success = await asyncio.to_thread(optimize_image, data, output_path)
            if success:
                logger.info("Headshot processed", ref=ref)
        else:
            logger.warning("Download failed", ref=ref, status=response.status, url=url)

async def main():
    logger.info("🚀 Starting Advanced Headshot Ingestion...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with aiohttp.ClientSession() as session:
        tasks = [download_driver(session, d) for d in DRIVER_ROSTER]
        await asyncio.gather(*tasks)
    
    # Update registry
    registry = {d["ref"]: f"/assets/drivers/{d['ref']}.webp" for d in DRIVER_ROSTER if (OUTPUT_DIR / f"{d['ref']}.webp").exists()}
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=2)
        
    logger.info("✅ Headshot Ingestion Complete", count=len(registry))

if __name__ == "__main__":
    asyncio.run(main())
