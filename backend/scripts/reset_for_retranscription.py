"""Reset videos to pending for re-transcription with segments"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def main():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Reset first 10 transcriptions to pending
    result = await db.processed_videos.update_many(
        {"transcription_status": "success", "is_wine_content": True},
        {"$set": {"transcription_status": "pending"},
         "$unset": {"transcription_segments": ""}}
    )
    
    print(f"Reset {result.modified_count} videos to pending for re-transcription with segments")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())

