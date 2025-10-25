"""
Smart TikTok Wine Scraper
- Only processes NEW videos (tracks what we've already done)
- Pre-filters non-wine videos (saves GPT costs)
- Uses audio transcription only when needed
- Stores video processing state
"""
import asyncio
import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from playwright.async_api import async_playwright
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from app.config import settings
from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.wine_extractor import extract_wines_from_text


def is_wine_related(caption: str) -> bool:
    """
    Pre-filter: Check if video is about wine BEFORE calling GPT
    Saves money by not processing irrelevant videos
    """
    if not caption or len(caption) < 20:
        return False
    
    caption_lower = caption.lower()
    
    # Wine-related keywords in Dutch
    wine_keywords = [
        'wijn', 'wijntje', 'wijnen',  # wine
        'rood', 'wit', 'rosé', 'rose', 'bubbels', 'mousserende',  # types
        'fles', 'bottle',  # bottle
        'proeven', 'smaak', 'rating', 'aanrader',  # tasting
        'supermarkt', 'albert heijn', 'jumbo', 'lidl', 'aldi', 'hema', 'dirk',  # supermarkets
        'koopje', 'deal', 'prijs',  # price/deal
        'malbec', 'chardonnay', 'sauvignon', 'cabernet', 'merlot',  # varieties
    ]
    
    # Check if caption contains any wine keywords
    for keyword in wine_keywords:
        if keyword in caption_lower:
            return True
    
    # Check for wine hashtags
    wine_hashtags = ['#wijn', '#wijntje', '#supermarktwijn', '#wijnreview']
    for hashtag in wine_hashtags:
        if hashtag in caption_lower:
            return True
    
    return False


async def get_new_video_urls(username: str, db):
    """
    Get only NEW video URLs that we haven't processed yet
    Uses infinite scroll to get ALL videos
    """
    url = f"https://www.tiktok.com/@{username}"
    all_video_urls = set()
    
    print(f"Fetching ALL videos from @{username}...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Scroll to load all videos
            previous_count = 0
            no_new_count = 0
            
            for scroll_num in range(50):  # Max 50 scrolls
                # Get video links
                video_elements = await page.query_selector_all('[data-e2e="user-post-item"] a')
                
                for elem in video_elements:
                    try:
                        href = await elem.get_attribute('href')
                        if href and '/video/' in href:
                            if not href.startswith('http'):
                                href = 'https://www.tiktok.com' + href
                            all_video_urls.add(href)
                    except:
                        pass
                
                current_count = len(all_video_urls)
                
                if current_count == previous_count:
                    no_new_count += 1
                    if no_new_count >= 3:
                        break
                else:
                    no_new_count = 0
                    if scroll_num % 5 == 0:  # Print every 5 scrolls
                        print(f"  Found {current_count} videos...")
                
                previous_count = current_count
                
                # Scroll
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await page.wait_for_timeout(1500)
            
            print(f"  Total: {len(all_video_urls)} videos")
            
        finally:
            await browser.close()
    
    # Filter out already processed videos
    processed_urls = set()
    async for video in db.processed_videos.find({"tiktok_handle": username}):
        processed_urls.add(video["video_url"])
    
    new_urls = all_video_urls - processed_urls
    
    print(f"  Already processed: {len(processed_urls)}")
    print(f"  NEW videos: {len(new_urls)}")
    
    return list(new_urls), list(all_video_urls)


async def process_videos_smart(username: str, video_urls: list, db):
    """
    Smart video processing:
    1. Get video captions
    2. Pre-filter for wine content
    3. Only process wine videos with GPT
    4. Track processed videos
    """
    
    print(f"\nProcessing {len(video_urls)} NEW videos...")
    print()
    
    # Scrape video data
    scraper = TikTokOEmbedScraper()
    videos = scraper.scrape_profile_videos(username, video_urls)
    
    # Stats
    wine_videos = 0
    non_wine_videos = 0
    wines_added = 0
    
    # Process each video
    for i, video in enumerate(videos, 1):
        caption = video.get("caption", "")
        video_url = video.get("post_url")
        
        # Pre-filter: Is this wine-related?
        if not is_wine_related(caption):
            non_wine_videos += 1
            
            # Mark as processed (no wine content)
            await db.processed_videos.insert_one({
                "video_url": video_url,
                "tiktok_handle": username,
                "processed_date": datetime.utcnow(),
                "wines_found": 0,
                "caption": caption[:200],
                "is_wine_content": False
            })
            
            if i % 10 == 0:
                print(f"  Processed {i}/{len(videos)} videos... ({wine_videos} wine-related)")
            continue
        
        # This video IS wine-related! Process it
        wine_videos += 1
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        print(f"\n  Wine Video {wine_videos}: {caption_clean[:60]}...")
        
        # Extract wines using GPT
        wines = extract_wines_from_text(caption)
        
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
                        "influencer_source": f"{username}_tiktok",
                        "post_url": video["post_url"],
                        "date_found": datetime.utcnow(),
                        "in_stock": None,
                        "last_checked": None
                    }
                    
                    await db.wines.insert_one(wine_doc)
                    wines_added += 1
                    print(f"      + {wine_data['name']} ({wine_data['supermarket']})")
                else:
                    print(f"      - Already in DB: {wine_data['name']}")
        
        # Mark video as processed
        await db.processed_videos.insert_one({
            "video_url": video_url,
            "tiktok_handle": username,
            "processed_date": datetime.utcnow(),
            "wines_found": len(wines),
            "caption": caption[:200],
            "is_wine_content": True
        })
    
    return wines_added, wine_videos, non_wine_videos


async def main():
    """Main smart scraper"""
    
    print("\n" + "#"*60)
    print("#  SMART TIKTOK WINE SCRAPER")
    print("#  - Only processes NEW videos")
    print("#  - Filters out non-wine content")
    print("#  - Saves GPT costs")
    print("#"*60)
    print()
    
    if len(sys.argv) > 1:
        username = sys.argv[1].replace('@', '')
    else:
        username = "pepijn.wijn"
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Step 1: Get ALL video URLs (only new ones)
    print("="*60)
    print("STEP 1: FINDING NEW VIDEOS")
    print("="*60)
    
    new_urls, all_urls = await get_new_video_urls(username, db)
    
    if not new_urls:
        print("\n[INFO] No new videos to process!")
        print(f"All {len(all_urls)} videos already processed.")
        client.close()
        return
    
    # Step 2: Process only new videos
    print()
    print("="*60)
    print("STEP 2: SMART PROCESSING")
    print("="*60)
    
    wines_added, wine_videos, non_wine = await process_videos_smart(username, new_urls, db)
    
    # Update influencer stats
    await db.influencers.update_one(
        {"tiktok_handle": username},
        {
            "$set": {"last_scraped": datetime.utcnow()},
            "$inc": {
                "total_videos_processed": len(new_urls),
                "total_wines_found": wines_added
            }
        },
        upsert=True
    )
    
    # Summary
    print()
    print("#"*60)
    print("#  SUMMARY")
    print("#"*60)
    print()
    print(f"Total videos on profile: {len(all_urls)}")
    print(f"Already processed: {len(all_urls) - len(new_urls)}")
    print(f"NEW videos processed: {len(new_urls)}")
    print()
    print(f"Wine-related videos: {wine_videos} [WINE]")
    print(f"Non-wine videos: {non_wine} [SKIP] (saved GPT cost)")
    print()
    print(f"NEW wines added: {wines_added}")
    print()
    
    # Cost calculation
    gpt_calls = wine_videos  # Only called GPT for wine videos
    estimated_cost = gpt_calls * 0.0003  # ~$0.0003 per call
    print(f"GPT API calls: {gpt_calls}")
    print(f"Estimated cost: ${estimated_cost:.4f}")
    print()
    
    if wines_added > 0:
        print("[SUCCESS] New wines added to database!")
        print("View at: http://localhost:5173/vinly/")
    else:
        print("[INFO] No new wines found in recent videos")
        print("(Wines may already exist or no wine content in new videos)")
    
    print()
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())

