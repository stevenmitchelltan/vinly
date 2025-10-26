"""Reset wine images for re-enrichment"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def main():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    result = await db.wines.update_many(
        {},
        {"$unset": {"image_urls": "", "image_url": ""}}
    )
    
    print(f"Reset images for {result.modified_count} wines")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())

