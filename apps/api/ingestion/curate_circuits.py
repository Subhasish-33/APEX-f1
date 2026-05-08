import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from apps.api.db import engine
from apps.api.models import Circuit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CIRCUIT_DATA = {
    "monaco": {
        "overtaking_difficulty": 9.5,
        "downforce_level": "HIGH",
        "tire_degradation": "LOW",
        "weather_volatility": 0.4,
        "safety_car_probability": 0.8,
        "top_speed_level": "LOW",
        "atmosphere_description": "Elite Street Circuit. The Jewel in the Crown."
    },
    "monza": {
        "overtaking_difficulty": 4.0,
        "downforce_level": "LOW",
        "tire_degradation": "MED",
        "weather_volatility": 0.3,
        "safety_car_probability": 0.4,
        "top_speed_level": "HIGH",
        "atmosphere_description": "Temple of Speed. The fastest track on the calendar."
    },
    "spa": {
        "overtaking_difficulty": 3.0,
        "downforce_level": "MED",
        "tire_degradation": "HIGH",
        "weather_volatility": 0.9,
        "safety_car_probability": 0.7,
        "top_speed_level": "HIGH",
        "atmosphere_description": "Legendary Ardennes masterpiece. Weather can change in an instant."
    },
    "silverstone": {
        "overtaking_difficulty": 4.5,
        "downforce_level": "HIGH",
        "tire_degradation": "HIGH",
        "weather_volatility": 0.6,
        "safety_car_probability": 0.5,
        "top_speed_level": "MED",
        "atmosphere_description": "The home of British motorsport. High-speed corners testing neck muscles."
    },
    "suzuka": {
        "overtaking_difficulty": 7.0,
        "downforce_level": "HIGH",
        "tire_degradation": "HIGH",
        "weather_volatility": 0.5,
        "safety_car_probability": 0.6,
        "top_speed_level": "MED",
        "atmosphere_description": "Technical Driver Circuit. The only figure-eight track in F1."
    }
}

async def curate_circuits():
    async with AsyncSession(engine) as session:
        for ref, data in CIRCUIT_DATA.items():
            logger.info(f"Curating {ref} personality...")
            stmt = update(Circuit).where(Circuit.circuit_id == ref).values(**data)
            await session.execute(stmt)
        await session.commit()
    logger.info("✅ Circuit curation complete!")

if __name__ == "__main__":
    asyncio.run(curate_circuits())
