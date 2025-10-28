"""
Seed TikTok influencers with video URLs
Run this to add Dutch wine TikTok creators to your database
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def seed_tiktok_influencers():
    """Add TikTok influencers with their wine video URLs"""
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # List of TikTok influencers and their wine video URLs
    # Add more as you discover them!
    influencers = [
        {
            "tiktok_handle": "pepijn.wijn",
            "is_active": True,
            "video_urls": [
                "https://www.tiktok.com/@pepijn.wijn/video/7353670393489657120",  # LIDL rosé
                "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329",  # HEMA Mas Couton
                # Add more video URLs here as you browse TikTok
            ]
        },
        # Add more TikTok creators here:
        # {
        #     "tiktok_handle": "another_wine_creator",
        #     "is_active": True,
        #     "video_urls": [
        #         "https://www.tiktok.com/@....",
        #     ]
        # },
    ]
    
    for influencer in influencers:
        # Check if already exists
        existing = await db.tiktok_influencers.find_one({
            "tiktok_handle": influencer["tiktok_handle"]
        })
        
        if not existing:
            await db.tiktok_influencers.insert_one(influencer)
            print(f"Added influencer: @{influencer['tiktok_handle']} with {len(influencer['video_urls'])} videos")
        else:
            # Update video URLs if new ones added
            await db.tiktok_influencers.update_one(
                {"tiktok_handle": influencer["tiktok_handle"]},
                {"$set": {"video_urls": influencer["video_urls"]}}
            )
            print(f"Updated influencer: @{influencer['tiktok_handle']}")
    
    print(f"\nSeeded {len(influencers)} TikTok influencers")
    print("\nTo add more wines:")
    print("  1. Browse TikTok for Dutch wine content")
    print("  2. Copy video URLs")
    print("  3. Add them to this script")
    print("  4. Run this script again")
    print("  5. Run the scraping job to extract wines")
    
    client.close()


if __name__ == "__main__":
    print("Seeding TikTok influencers...")
    asyncio.run(seed_tiktok_influencers())

