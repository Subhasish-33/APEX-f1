import httpx
import asyncio
import logging
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential

from db import engine, init_db as db_init

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

BASE_URL = "https://api.jolpi.ca/ergast/f1"
CURRENT_YEAR = datetime.now().year
INGESTION_VERSION = "3.0.0"

def get_race_status(race_date, year):
    now = datetime.now().date()
    if year > now.year:
        return "SCHEDULED"
    if race_date < now:
        return "COMPLETED"
    if race_date == now:
        return "LIVE"
    return "SCHEDULED"

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def fetch_one(endpoint: str, offset: int = 0, limit: int = 100):
    """Fetch a single page of data from Jolpica API."""
    await asyncio.sleep(0.3)  # Polite rate limiting (3 requests per second)
    url = f"{BASE_URL}/{endpoint}"
    sep = "&" if "?" in endpoint else "?"
    url = f"{url}{sep}limit={limit}&offset={offset}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.get(url)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None

async def fetch_all(endpoint: str, data_key: list):
    """Fetch all pages of data from Jolpica API (Auto-Pagination)."""
    offset = 0
    limit = 100
    all_items = []
    
    while True:
        data = await fetch_one(endpoint, offset, limit)
        if not data:
            break
            
        mr_data = data.get("MRData", {})
        
        # Traverse data_key to get the list of items
        items = mr_data
        for k in data_key:
            items = items.get(k, {})
        
        if not items or not isinstance(items, list):
            break
            
        all_items.extend(items)
        total = int(mr_data.get("total", 0))
        offset += limit
        
        if offset >= total:
            break
            
    return all_items

async def init_db():
    await db_init()

async def get_driver_id(session, driver_ref):
    from sqlalchemy import text
    res = await session.execute(
        text("SELECT driver_id FROM drivers WHERE driver_ref = :ref"),
        {"ref": driver_ref}
    )
    row = res.fetchone()
    return row[0] if row else None

async def get_constructor_id(session, constructor_ref):
    from sqlalchemy import text
    res = await session.execute(
        text("SELECT constructor_id FROM constructors WHERE constructor_ref = :ref"),
        {"ref": constructor_ref}
    )
    row = res.fetchone()
    return row[0] if row else None
