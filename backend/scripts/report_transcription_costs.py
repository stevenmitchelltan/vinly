"""
Transcription Cost Monitoring

Reports on transcription costs and statistics
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def report_transcription_costs():
    """Generate transcription cost report"""
    
    print("\n" + "="*70)
    print("  TRANSCRIPTION COST REPORT")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Get all processed videos with transcription data
    total_videos = await db.processed_videos.count_documents({})
    successful = await db.processed_videos.count_documents({"transcription_status": "success"})
    failed = await db.processed_videos.count_documents({"transcription_status": "failed"})
    pending = await db.processed_videos.count_documents({
        "$or": [
            {"transcription_status": "pending"},
            {"transcription_status": {"$exists": False}}
        ],
        "is_wine_content": True
    })
    
    print(f"Total videos processed: {total_videos}")
    print(f"  Transcribed successfully: {successful}")
    print(f"  Transcription failed: {failed}")
    print(f"  Pending transcription: {pending}")
    print()
    
    if successful == 0:
        print("[INFO] No transcriptions yet!")
        client.close()
        return
    
    # Calculate costs
    total_duration = 0
    videos_with_duration = 0
    
    async for video in db.processed_videos.find({"transcription_status": "success"}):
        if "audio_duration_seconds" in video:
            total_duration += video["audio_duration_seconds"]
            videos_with_duration += 1
    
    total_minutes = total_duration / 60
    total_hours = total_duration / 3600
    
    # Whisper cost: $0.006 per minute
    whisper_cost = total_minutes * 0.006
    
    # GPT cost: $0.001 per video (approximate)
    gpt_cost = successful * 0.001
    
    total_cost = whisper_cost + gpt_cost
    
    print("="*70)
    print("COST ANALYSIS")
    print("="*70)
    print()
    print(f"Total audio duration: {total_hours:.2f} hours ({total_minutes:.1f} minutes)")
    print(f"Average per video: {total_duration/successful:.1f} seconds")
    print()
    print(f"Whisper transcription cost: ${whisper_cost:.4f}")
    print(f"GPT extraction cost: ${gpt_cost:.4f}")
    print(f"Total cost: ${total_cost:.4f}")
    print()
    
    # Cost per wine
    total_wines = await db.wines.count_documents({})
    if total_wines > 0:
        cost_per_wine = total_cost / total_wines
        print(f"Total wines extracted: {total_wines}")
        print(f"Cost per wine: ${cost_per_wine:.4f}")
        print()
    
    # Success rate
    if videos_with_duration > 0:
        success_rate = (successful / total_videos) * 100 if total_videos > 0 else 0
        print(f"Transcription success rate: {success_rate:.1f}%")
        print()
    
    # Recent failures
    if failed > 0:
        print("="*70)
        print("RECENT FAILURES")
        print("="*70)
        print()
        
        count = 0
        async for video in db.processed_videos.find({"transcription_status": "failed"}).limit(5):
            count += 1
            error = video.get("transcription_error", "Unknown error")
            url = video.get("video_url", "")
            video_id = url.split('/')[-1] if url else "unknown"
            print(f"{count}. Video {video_id}")
            print(f"   Error: {error}")
            print()
    
    client.close()


if __name__ == "__main__":
    asyncio.run(report_transcription_costs())

