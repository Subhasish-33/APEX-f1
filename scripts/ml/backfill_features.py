import asyncio
import json
import structlog
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from apps.api.db import async_session, init_db
from apps.api.models import Race, Result, MLFeature, Driver
from apps.api.ml.features import FeatureBuilder
from datetime import datetime

logger = structlog.get_logger()

async def backfill():
    """Generates features for all historical races and saves them to the DB."""
    logger.info("Starting ML Feature Backfill pipeline...")
    await init_db()
    
    async with async_session() as session:
        # Get all completed races from 2010 onwards
        stmt = select(Race).where(
            Race.year >= 2010,
            Race.date < datetime.utcnow().date()
        ).order_by(Race.year, Race.round)
        
        races_result = await session.execute(stmt)
        races = races_result.scalars().all()
        
        builder = FeatureBuilder(session)
        total_features_written = 0
        
        for race in races:
            logger.info("Processing race...", race_name=race.name, year=race.year)
            
            # Find all drivers who participated in this race
            driver_stmt = select(Result.driver_id).where(Result.race_id == race.race_id)
            drivers_res = await session.execute(driver_stmt)
            driver_ids = drivers_res.scalars().all()
            
            for d_id in driver_ids:
                # Build feature vector
                vector = await builder.build_full_feature_vector(race.race_id, d_id)
                
                if vector:
                    # Write to DB
                    mlf = MLFeature(
                        race_id=race.race_id,
                        driver_id=d_id,
                        feature_vector=vector,
                        feature_version="v1.0",
                        source_hash="batch_backfill",
                        validation_status="VALID",
                        confidence_metadata={"imputed_fields": 0}
                    )
                    session.add(mlf)
                    total_features_written += 1
            
            # Commit per race
            await session.commit()
            
        logger.info("Backfill complete.", total_features_written=total_features_written)

if __name__ == "__main__":
    asyncio.run(backfill())
