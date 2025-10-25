"""
Re-extract wines from videos that now have transcriptions

This script finds videos that:
- Have been transcribed (transcription_status = success)
- Were already processed for wine extraction
- Now can be re-analyzed with the transcription for better results
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.wine_extractor import extract_wines_from_caption_and_transcription


async def reextract_with_transcriptions(username: str = None):
    """
    Re-extract wines from transcribed videos
    
    Args:
        username: Optional - only process this TikTok user
    """
    
    print("\n" + "="*70)
    print("  RE-EXTRACTION WITH TRANSCRIPTIONS")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Find videos with successful transcriptions
    query = {
        "transcription_status": "success",
        "is_wine_content": True
    }
    
    if username:
        query["tiktok_handle"] = username
        print(f"Filtering for: @{username}")
    
    transcribed_videos = []
    async for video in db.processed_videos.find(query):
        transcribed_videos.append(video)
    
    total = len(transcribed_videos)
    
    if total == 0:
        print("\n[INFO] No transcribed videos found!")
        print("Run: python scripts/transcribe_videos.py first")
        client.close()
        return
    
    print(f"Found {total} videos with transcriptions")
    print()
    print("="*70)
    
    wines_added = 0
    
    for i, video in enumerate(transcribed_videos, 1):
        video_url = video.get("video_url")
        video_id = video_url.split('/')[-1] if video_url else "unknown"
        caption = video.get("caption", "")
        transcription = video.get("transcription", "")
        
        print(f"\n{i}/{total}. Video: {video_id}")
        
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        print(f"    Caption: {caption_clean[:60]}...")
        print(f"    Transcription: {len(transcription)} characters")
        
        # Extract wines using caption + transcription
        wines = extract_wines_from_caption_and_transcription(caption, transcription)
        
        if wines:
            print(f"    Found {len(wines)} wine(s)!")
            
            for wine_data in wines:
                # Check if exists
                existing = await db.wines.find_one({
                    "name": wine_data["name"],
                    "supermarket": wine_data["supermarket"]
                })
                
                if not existing:
                    # Add wine
                    wine_doc = {
                        "name": wine_data["name"],
                        "supermarket": wine_data["supermarket"],
                        "wine_type": wine_data["wine_type"],
                        "image_url": video.get("thumbnail_url"),
                        "rating": wine_data.get("rating"),
                        "description": wine_data.get("description"),
                        "influencer_source": f"{video.get('tiktok_handle', 'unknown')}_tiktok",
                        "post_url": video_url,
                        "date_found": datetime.now(timezone.utc),
                        "in_stock": None,
                        "last_checked": None
                    }
                    
                    await db.wines.insert_one(wine_doc)
                    wines_added += 1
                    print(f"      + {wine_data['name']} ({wine_data['supermarket']})")
                else:
                    print(f"      - Already in DB: {wine_data['name']}")
        else:
            print(f"    No wines extracted")
    
    # Summary
    print()
    print("="*70)
    print("RE-EXTRACTION COMPLETE")
    print("="*70)
    print(f"Videos processed: {total}")
    print(f"NEW wines added: {wines_added}")
    print()
    
    client.close()


if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(reextract_with_transcriptions(username))

