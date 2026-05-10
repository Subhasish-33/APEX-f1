from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db import engine

router = APIRouter()

@router.get("/standings/drivers")
async def driver_standings():
    async with AsyncSession(engine) as session:
        result = await session.execute(text("""
            SELECT d.forename, d.surname, ds.points, ds.position
            FROM driver_standings ds
            JOIN drivers d ON ds.driver_id = d.driver_id
            ORDER BY ds.points DESC
            LIMIT 20
        """))

        rows = result.fetchall()

        return [
            {
                "name": f"{r[0]} {r[1]}",
                "points": r[2],
                "position": r[3]
            }
            for r in rows
        ]