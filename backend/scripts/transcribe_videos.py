"""
Batch Video Transcription Script

Separate step that downloads and transcribes videos that passed the supermarket filter.
Run this after scraping to add transcriptions to the database.

Usage:
    python scripts/transcribe_videos.py                  # All pending videos
    python scripts/transcribe_videos.py pepijn.wijn      # Specific influencer
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio


async def transcribe_pending_videos(username: str = None):
    """
    Find and transcribe videos that need transcription
    
    Args:
        username: Optional - only transcribe videos from this TikTok user
    """
    print("\n" + "="*70)
    print("  VIDEO TRANSCRIPTION - BATCH PROCESSOR")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Build query for pending videos
    query = {
        "is_wine_content": True,  # Passed supermarket filter
        "$or": [
            {"transcription_status": {"$exists": False}},  # Never transcribed
            {"transcription_status": "pending"},           # Pending
            {"transcription_status": "failed"},            # Failed, retry
        ]
    }
    
    if username:
        query["tiktok_handle"] = username
        print(f"Filtering for: @{username}")
    
    # Get pending videos
    pending_videos = []
    async for video in db.processed_videos.find(query):
        pending_videos.append(video)
    
    total = len(pending_videos)
    
    if total == 0:
        print("\n[INFO] No pending videos to transcribe!")
        client.close()
        return
    
    print(f"\nFound {total} videos needing transcription")
    print()
    print("="*70)
    
    # Initialize downloader
    downloader = TikTokVideoDownloader()
    
    # Process each video
    transcribed = 0
    failed = 0
    
    for i, video in enumerate(pending_videos, 1):
        video_url = video.get("video_url")
        video_id = video_url.split('/')[-1]
        
        print(f"\n{i}/{total}. Processing: {video_id}")
        print(f"    URL: {video_url}")
        
        try:
            # Step 1: Download audio (and try to get post date)
            dl_result = downloader.download_video_audio(video_url)
            if isinstance(dl_result, tuple):
                audio_path, post_date = dl_result
            else:
                audio_path, post_date = dl_result, None
            
            if not audio_path:
                # Download failed
                await db.processed_videos.update_one(
                    {"video_url": video_url},
                    {"$set": {
                        "transcription_status": "failed",
                        "transcription_error": "Audio download failed",
                        "transcription_date": datetime.now(timezone.utc)
                    }}
                )
                failed += 1
                print("    [FAILED] Could not download audio")
                continue
            
            # Step 2: Transcribe
            transcription_result = transcribe_video_audio(audio_path)
            
            # Step 3: Update database
            if transcription_result['status'] == 'success':
                # Save transcription, metrics, and post date on processed video
                update_doc = {
                    "transcription": transcription_result['text'],
                    "transcription_status": "success",
                    "transcription_date": datetime.now(timezone.utc),
                    "audio_duration_seconds": transcription_result['duration'],
                    "asr_metrics": transcription_result.get('metrics', {}),
                    "transcription_error": None
                }
                if post_date:
                    update_doc["post_date"] = post_date
                await db.processed_videos.update_one(
                    {"video_url": video_url},
                    {"$set": update_doc}
                )
                transcribed += 1
                print(f"    [SUCCESS] Transcribed ({transcription_result['duration']:.1f}s)")
            else:
                # Transcription failed (already retried once)
                await db.processed_videos.update_one(
                    {"video_url": video_url},
                    {"$set": {
                        "transcription_status": "failed",
                        "transcription_error": transcription_result['error'],
                        "transcription_date": datetime.now(timezone.utc)
                    }}
                )
                failed += 1
                print(f"    [FAILED] {transcription_result['error']}")
            
            # Step 4: Cleanup audio file
            downloader.cleanup_audio_file(audio_path)
            
        except Exception as e:
            print(f"    [ERROR] Unexpected error: {e}")
            await db.processed_videos.update_one(
                {"video_url": video_url},
                {"$set": {
                    "transcription_status": "failed",
                    "transcription_error": str(e),
                    "transcription_date": datetime.now(timezone.utc)
                }}
            )
            failed += 1
    
    # Summary
    print()
    print("="*70)
    print("TRANSCRIPTION COMPLETE")
    print("="*70)
    print(f"Total processed: {total}")
    print(f"Successful: {transcribed}")
    print(f"Failed: {failed}")
    
    # Cost calculation
    total_duration = 0
    async for video in db.processed_videos.find({"transcription_status": "success"}):
        if "audio_duration_seconds" in video:
            total_duration += video["audio_duration_seconds"]
    
    total_minutes = total_duration / 60
    whisper_cost = total_minutes * 0.006
    
    print()
    print(f"Total audio duration: {total_minutes:.1f} minutes")
    print(f"Estimated Whisper cost: ${whisper_cost:.4f}")
    print()
    
    client.close()


if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(transcribe_pending_videos(username))

