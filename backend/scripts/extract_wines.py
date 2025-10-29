"""
Extract wines from transcribed videos

This script finds videos that:
- Have been transcribed (transcription_status = success)
- Are wine content (passed supermarket filter)
- Extracts wine data using caption + transcription
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.wine_extractor import extract_wines_from_caption_and_transcription


async def extract_wines(username: str = None):
    """
    Extract wines from transcribed videos
    
    Args:
        username: Optional - only process this TikTok user
    """
    
    print("\n" + "="*70)
    print("  WINE EXTRACTION FROM TRANSCRIPTIONS")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
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
                # Check if this video already has a wine (one wine per video)
                # Using post_url as unique identifier allows safe editing of all fields
                existing = await db.wines.find_one({
                    "post_url": video_url
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
                        # Prefer original post date if available
                        "date_found": video.get("post_date") or datetime.now(timezone.utc),
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
    print("EXTRACTION COMPLETE")
    print("="*70)
    print(f"Videos processed: {total}")
    print(f"NEW wines added: {wines_added}")
    print()
    
    client.close()


if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(extract_wines(username))

