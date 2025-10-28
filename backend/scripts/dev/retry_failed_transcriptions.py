"""
Retry failed transcriptions

Sometimes videos fail due to temporary issues (network, rate limiting, etc.)
This script retries them
"""
import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio


async def retry_failed():
    """Retry all failed transcriptions"""
    
    print("\n" + "="*70)
    print("  RETRY FAILED TRANSCRIPTIONS")
    print("="*70)
    print()
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Get failed videos
    failed_videos = []
    async for video in db.processed_videos.find({"transcription_status": "failed"}):
        failed_videos.append(video)
    
    if len(failed_videos) == 0:
        print("[INFO] No failed transcriptions to retry!")
        client.close()
        return
    
    print(f"Found {len(failed_videos)} failed transcriptions")
    print()
    
    downloader = TikTokVideoDownloader()
    
    retried = 0
    still_failed = 0
    
    for i, video in enumerate(failed_videos, 1):
        video_url = video.get("video_url")
        video_id = video_url.split('/')[-1]
        previous_error = video.get("transcription_error", "Unknown")
        
        print(f"{i}/{len(failed_videos)}. Retrying: {video_id}")
        print(f"    Previous error: {previous_error}")
        
        # Try downloading again
        audio_path = downloader.download_video_audio(video_url)
        
        if not audio_path:
            print(f"    [STILL FAILED] Could not download")
            still_failed += 1
            continue
        
        # Try transcribing
        result = transcribe_video_audio(audio_path)
        
        if result['status'] == 'success':
            await db.processed_videos.update_one(
                {"video_url": video_url},
                {"$set": {
                    "transcription": result['text'],
                    "transcription_status": "success",
                    "transcription_date": datetime.utcnow(),
                    "audio_duration_seconds": result['duration'],
                    "transcription_error": None
                }}
            )
            retried += 1
            print(f"    [SUCCESS] Transcribed on retry!")
        else:
            print(f"    [STILL FAILED] {result['error']}")
            still_failed += 1
        
        downloader.cleanup_audio_file(audio_path)
    
    print()
    print("="*70)
    print(f"Retry complete: {retried} succeeded, {still_failed} still failed")
    print("="*70)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(retry_failed())

