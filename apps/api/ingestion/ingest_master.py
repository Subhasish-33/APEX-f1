import asyncio
import argparse
from core import logger, init_db

# Import specific ingestors
import ingest_metadata
import ingest_season
import ingest_results
import ingest_standings

async def run_master_ingestion(target_year=None, full_history=False):
    logger.info("==================================================")
    logger.info("APEX-F1 CANONICAL WAREHOUSE RECONSTRUCTION")
    logger.info("==================================================")
    
    # 0. Initialize Infrastructure
    # await init_db() # Handled by scripts if needed

    # 1. Metadata (Drivers/Constructors)
    await ingest_metadata.main()
    
    # 2. Season & Race Skeletons
    if full_history:
        await ingest_season.main() # Ingests 2020-2026 by default in its main
    else:
        # Just ensure the target year skeleton exists
        year = target_year or 2024
        await ingest_season.ingest_races_for_year(year)

    # 3. Tier 1 Facts (Results)
    if full_history:
        # Hydrate last 2 years of results for truth
        for y in range(2023, 2025):
            await ingest_results.ingest_results_for_year(y)
    else:
        year = target_year or 2024
        await ingest_results.ingest_results_for_year(year)

    # 4. Tier 2 Derived Data (Standings)
    if full_history:
        for y in range(2023, 2025):
            await ingest_standings.recompute_standings_for_year(y)
    else:
        year = target_year or 2024
        await ingest_standings.recompute_standings_for_year(year)

    logger.info("==================================================")
    logger.info("WAREHOUSE RECONSTRUCTION COMPLETE")
    logger.info("==================================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX-F1 Master Ingestion Orchestrator")
    parser.add_argument("--year", type=int, help="Target year for surgical ingestion")
    parser.add_argument("--full", action="store_true", help="Run reconstruction for historical window (2023-2024)")
    
    args = parser.parse_args()
    asyncio.run(run_master_ingestion(target_year=args.year, full_history=args.full))
