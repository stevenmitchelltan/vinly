"""
Full test: Scrape TikTok and extract wine information
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.scrapers.tiktok_scraper import TikTokScraper
from app.services.wine_extractor import extract_wines_from_text


async def test_tiktok_wine_extraction():
    """Test full pipeline: TikTok scraping + wine extraction"""
    
    print("\n" + "#"*60)
    print("#  TIKTOK WINE EXTRACTION TEST")
    print("#"*60)
    print()
    
    username = "pepijn.wijn"
    
    # Step 1: Scrape TikTok
    print("STEP 1: Scraping TikTok profile")
    print("="*60)
    
    scraper = TikTokScraper()
    videos = await scraper.scrape_profile(username, max_videos=10)
    
    print(f"\nFound {len(videos)} videos")
    print()
    
    if not videos:
        print("[ERROR] No videos found!")
        print("  The account may be private or has no videos")
        return
    
    # Step 2: Extract wines from video descriptions
    print("STEP 2: Extracting wine information")
    print("="*60)
    print()
    
    total_wines = 0
    
    for i, video in enumerate(videos, 1):
        caption = video.get("caption", "")
        
        if not caption or len(caption) < 20:
            print(f"Video {i}: No description or too short, skipping")
            continue
        
        print(f"Video {i}:")
        print(f"  URL: {video['post_url']}")
        print(f"  Caption: {caption[:100]}...")
        print(f"  Views: {video.get('views', 0):,}")
        print()
        
        # Extract wines
        wines = extract_wines_from_text(caption)
        
        if wines:
            print(f"  [FOUND] {len(wines)} wine(s)!")
            for wine in wines:
                print(f"    - {wine['name']} ({wine['supermarket']})")
                print(f"      Type: {wine['wine_type']}, Rating: {wine.get('rating', 'N/A')}")
            total_wines += len(wines)
        else:
            print("  [NONE] No wines detected in this video")
        
        print()
    
    # Summary
    print()
    print("#"*60)
    print("#  SUMMARY")
    print("#"*60)
    print()
    print(f"Videos scraped: {len(videos)}")
    print(f"Wines found: {total_wines}")
    print()
    
    if total_wines > 0:
        print("[SUCCESS] TikTok scraping works!")
        print()
        print("NEXT STEPS:")
        print("  1. Integrate TikTok scraper into main scraping job")
        print("  2. Run daily to get new wine recommendations")
        print("  3. TikTok is MUCH more reliable than Instagram!")
    else:
        print("[INFO] No wines found in recent videos")
        print()
        print("POSSIBLE REASONS:")
        print("  - This creator doesn't post wine content on TikTok")
        print("  - Recent videos don't mention specific wines")
        print("  - Try a different Dutch wine TikTok creator")
        print()
        print("SUGGESTION:")
        print("  Search TikTok for Dutch wine hashtags:")
        print("    #supermarktwijn")
        print("    #wijnreview")
        print("    #wijntips")
    print()


if __name__ == "__main__":
    asyncio.run(test_tiktok_wine_extraction())

