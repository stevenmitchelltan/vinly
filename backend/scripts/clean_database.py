"""
Clean database - removes all wines and processed videos
Use this to start fresh
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def clean_database():
    """Remove all wines and processed videos"""
    
    print("\n" + "="*70)
    print("  DATABASE CLEANUP")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Count before deletion
    wines_count = await db.wines.count_documents({})
    processed_count = await db.processed_videos.count_documents({})
    
    print(f"Current database contents:")
    print(f"  Wines: {wines_count}")
    print(f"  Processed videos: {processed_count}")
    print()
    
    # Confirm deletion
    print("WARNING: This will delete ALL data!")
    print()
    
    # Delete all wines
    result_wines = await db.wines.delete_many({})
    print(f"[DELETED] Wines: {result_wines.deleted_count}")
    
    # Delete all processed videos
    result_videos = await db.processed_videos.delete_many({})
    print(f"[DELETED] Processed videos: {result_videos.deleted_count}")
    
    print()
    print("="*70)
    print("Database cleaned successfully!")
    print("="*70)
    print()
    
    client.close()


if __name__ == "__main__":
    asyncio.run(clean_database())

