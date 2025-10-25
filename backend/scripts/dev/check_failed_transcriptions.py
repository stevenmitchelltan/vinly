"""
Check which transcriptions failed and why
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def check_failures():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    print("\n=== FAILED TRANSCRIPTIONS ===\n")
    
    async for video in db.processed_videos.find({"transcription_status": "failed"}):
        print(f"Video: {video.get('video_url', '')}")
        print(f"Error: {video.get('transcription_error', 'Unknown')}")
        print(f"Caption: {video.get('caption', '')[:100]}")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_failures())

