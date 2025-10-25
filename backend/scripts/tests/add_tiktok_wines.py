"""
Add wines from TikTok to the database
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.wine_extractor import extract_wines_from_text


async def add_tiktok_wines():
    """Scrape TikTok and add wines to database"""
    
    print("\n" + "#"*60)
    print("#  ADDING TIKTOK WINES TO DATABASE")
    print("#"*60)
    print()
    
    # Example videos from @pepijn.wijn
    video_urls = [
        "https://www.tiktok.com/@pepijn.wijn/video/7353670393489657120",  # LIDL rosé
        "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329",  # HEMA
        "https://www.tiktok.com/@pepijn.wijn/video/7564008681742912800",
    ]
    
    # Scrape videos
    scraper = TikTokOEmbedScraper()
    videos = scraper.scrape_profile_videos("pepijn.wijn", video_urls)
    
    print(f"Scraped {len(videos)} videos")
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    wines_added = 0
    
    # Process each video
    for video in videos:
        caption = video.get("caption", "")
        
        if len(caption) < 20:
            continue
        
        # Extract wines
        wines = extract_wines_from_text(caption)
        
        for wine_data in wines:
            # Check if wine already exists
            existing = await db.wines.find_one({
                "name": wine_data["name"],
                "supermarket": wine_data["supermarket"]
            })
            
            if not existing:
                # Add wine to database
                wine_doc = {
                    "name": wine_data["name"],
                    "supermarket": wine_data["supermarket"],
                    "wine_type": wine_data["wine_type"],
                    "image_url": video.get("thumbnail_url"),  # Use TikTok thumbnail
                    "rating": wine_data.get("rating"),
                    "description": wine_data.get("description"),
                    "influencer_source": "pepijn.wijn_tiktok",
                    "post_url": video["post_url"],
                    "date_found": datetime.now(timezone.utc),
                    "in_stock": None,
                    "last_checked": None
                }
                
                await db.wines.insert_one(wine_doc)
                wines_added += 1
                print(f"[+] Added: {wine_data['name']} ({wine_data['supermarket']})")
            else:
                print(f"[-] Already exists: {wine_data['name']}")
    
    client.close()
    
    print()
    print("#"*60)
    print(f"#  ADDED {wines_added} WINES FROM TIKTOK!")
    print("#"*60)
    print()
    print("Visit http://localhost:5173/vinly/ to see them!")
    print()


if __name__ == "__main__":
    asyncio.run(add_tiktok_wines())

