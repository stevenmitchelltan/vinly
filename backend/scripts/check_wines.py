"""Quick script to check wines in database"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def check_wines():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    total = await db.wines.count_documents({})
    real_wines = await db.wines.count_documents({'influencer_source': {'$ne': 'test_data'}})
    test_wines = await db.wines.count_documents({'influencer_source': 'test_data'})
    
    print(f"Total wines: {total}")
    print(f"Test wines: {test_wines}")
    print(f"Real wines from Instagram: {real_wines}")
    
    if real_wines > 0:
        print("\n=== Real Wines Found ===")
        async for wine in db.wines.find({'influencer_source': {'$ne': 'test_data'}}).limit(5):
            print(f"  - {wine['name']} ({wine['supermarket']}) - @{wine['influencer_source']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_wines())

