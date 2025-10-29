"""
Fully automated TikTok wine scraping
1. Get all video URLs from a TikTok profile
2. Extract wine data from each video
3. Save to database
All in one command!
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from playwright.async_api import async_playwright
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.wine_extractor import extract_wines_from_text


async def get_video_urls(username: str, max_videos: int = 50):
    """Get all video URLs from TikTok profile"""
    url = f"https://www.tiktok.com/@{username}"
    video_urls = []
    
    print(f"Fetching videos from @{username}...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Try JSON data first
            try:
                universal_data = await page.evaluate('''() => {
                    const script = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__');
                    if (script) {
                        return JSON.parse(script.textContent);
                    }
                    return null;
                }''')
                
                if universal_data:
                    user_detail = universal_data.get('__DEFAULT_SCOPE__', {}).get('webapp.user-detail', {})
                    item_list = user_detail.get('itemList', [])
                    
                    for item in item_list[:max_videos]:
                        video_id = item.get('id')
                        if video_id:
                            video_urls.append(f"https://www.tiktok.com/@{username}/video/{video_id}")
            except:
                pass
            
            # Fallback to DOM scraping
            if not video_urls:
                await page.wait_for_timeout(2000)
                video_elements = await page.query_selector_all('[data-e2e="user-post-item"]')
                
                for video_elem in video_elements[:max_videos]:
                    try:
                        link_elem = await video_elem.query_selector('a')
                        if link_elem:
                            href = await link_elem.get_attribute('href')
                            if href and '/video/' in href:
                                if not href.startswith('http'):
                                    href = 'https://www.tiktok.com' + href
                                video_urls.append(href)
                    except:
                        pass
        
        finally:
            await browser.close()
    
    return list(dict.fromkeys(video_urls))  # Remove duplicates


async def process_videos(username: str, video_urls: list):
    """Process videos and extract wines"""
    
    print(f"\nProcessing {len(video_urls)} videos...")
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Scrape video data
    scraper = TikTokOEmbedScraper()
    videos = scraper.scrape_profile_videos(username, video_urls)
    
    print(f"Got data for {len(videos)} videos")
    print()
    
    wines_added = 0
    videos_with_wines = 0
    
    # Extract wines from each video
    for i, video in enumerate(videos, 1):
        caption = video.get("caption", "")
        
        if len(caption) < 20:
            continue
        
        # Extract wines
        wines = extract_wines_from_text(caption)
        
        if wines:
            videos_with_wines += 1
            print(f"Video {i}/{len(videos)}: Found {len(wines)} wine(s)")
            
            for wine_data in wines:
                # Check if this video already has a wine (one wine per video)
                # Using post_url as unique identifier allows safe editing of all fields
                existing = await db.wines.find_one({
                    "post_url": video["post_url"]
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
                        "date_found": datetime.now(timezone.utc),
                        "in_stock": None,
                        "last_checked": None
                    }
                    
                    await db.wines.insert_one(wine_doc)
                    wines_added += 1
                    print(f"  + Added: {wine_data['name']} ({wine_data['supermarket']})")
                else:
                    print(f"  - Already exists: {wine_data['name']}")
    
    client.close()
    
    return wines_added, videos_with_wines


async def main():
    """Main function"""
    
    print("\n" + "#"*60)
    print("#  AUTOMATED TIKTOK WINE SCRAPER")
    print("#"*60)
    print()
    
    # Get username from command line
    if len(sys.argv) > 1:
        username = sys.argv[1].replace('@', '')
    else:
        username = "pepijn.wijn"
    
    max_videos = 50
    
    print(f"Target: @{username}")
    print(f"Max videos: {max_videos}")
    print()
    
    # Step 1: Get video URLs
    print("="*60)
    print("STEP 1: FINDING VIDEOS")
    print("="*60)
    
    video_urls = await get_video_urls(username, max_videos)
    
    if not video_urls:
        print("\nNo videos found!")
        return
    
    print(f"Found {len(video_urls)} videos")
    print()
    
    # Step 2: Process videos and extract wines
    print("="*60)
    print("STEP 2: EXTRACTING WINES")
    print("="*60)
    print()
    
    wines_added, videos_with_wines = await process_videos(username, video_urls)
    
    # Summary
    print()
    print("#"*60)
    print("#  SUMMARY")
    print("#"*60)
    print()
    print(f"Videos scanned: {len(video_urls)}")
    print(f"Videos with wine content: {videos_with_wines}")
    print(f"New wines added: {wines_added}")
    print()
    
    if wines_added > 0:
        print("[SUCCESS] Wines added to database!")
        print()
        print("View at: http://localhost:5173/vinly/")
    else:
        print("[INFO] No new wines found")
        print("(Wines may already be in database)")
    
    print()


if __name__ == "__main__":
    asyncio.run(main())

