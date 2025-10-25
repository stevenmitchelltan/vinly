"""
View transcription for a specific video
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def view_transcription(video_id: str):
    """Show transcription for a video"""
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Find video by ID
    video = await db.processed_videos.find_one(
        {"video_url": {"$regex": video_id}}
    )
    
    if not video:
        print(f"Video {video_id} not found!")
        client.close()
        return
    
    print("\n" + "="*70)
    print("  VIDEO TRANSCRIPTION DETAILS")
    print("="*70)
    print()
    
    caption = video.get("caption", "")
    transcription = video.get("transcription", "")
    status = video.get("transcription_status", "pending")
    duration = video.get("audio_duration_seconds", 0)
    
    print(f"Video ID: {video_id}")
    print(f"URL: {video.get('video_url', '')}")
    print()
    print(f"Transcription Status: {status}")
    print(f"Audio Duration: {duration:.1f} seconds")
    print()
    
    print("="*70)
    print("CAPTION (from TikTok)")
    print("="*70)
    print(caption.encode('ascii', 'ignore').decode('ascii'))
    print()
    
    if transcription:
        print("="*70)
        print("TRANSCRIPTION (from Whisper API)")
        print("="*70)
        print(transcription.encode('ascii', 'ignore').decode('ascii'))
        print()
        
        print("="*70)
        print("COMPARISON")
        print("="*70)
        print(f"Caption length: {len(caption)} characters")
        print(f"Transcription length: {len(transcription)} characters")
        print(f"Information gain: {len(transcription) - len(caption)} characters ({(len(transcription)/len(caption) - 1)*100:.0f}% more!)")
    else:
        print("[NO TRANSCRIPTION AVAILABLE]")
    
    print()
    
    client.close()


if __name__ == "__main__":
    video_id = sys.argv[1] if len(sys.argv) > 1 else "7353670393489657120"
    asyncio.run(view_transcription(video_id))

