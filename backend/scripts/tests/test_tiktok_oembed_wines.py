"""
Complete test: TikTok oEmbed scraping + wine extraction
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.wine_extractor import extract_wines_from_text


def test_tiktok_oembed_pipeline():
    """Test oEmbed scraping + wine extraction"""
    
    print("\n" + "#"*60)
    print("#  TIKTOK OEMBED + WINE EXTRACTION TEST")
    print("#"*60)
    print()
    
    # Example videos from @pepijn.wijn
    # You would get these by browsing their profile manually
    video_urls = [
        "https://www.tiktok.com/@pepijn.wijn/video/7353670393489657120",  # LIDL rosé
        "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329",
        "https://www.tiktok.com/@pepijn.wijn/video/7564008681742912800",
    ]
    
    print(f"Testing {len(video_urls)} videos from @pepijn.wijn")
    print()
    
    # Scrape videos
    scraper = TikTokOEmbedScraper()
    videos = scraper.scrape_profile_videos("pepijn.wijn", video_urls)
    
    print(f"\n[OK] Scraped {len(videos)} videos")
    print()
    
    # Extract wines from each video
    print("="*60)
    print("EXTRACTING WINE INFORMATION")
    print("="*60)
    print()
    
    total_wines = 0
    
    for i, video in enumerate(videos, 1):
        caption = video.get("caption", "")
        
        # Remove emojis for clean printing
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        
        print(f"Video {i}:")
        print(f"  URL: {video['post_url']}")
        print(f"  Caption: {caption_clean[:100]}...")
        print()
        
        if len(caption) < 20:
            print("  [SKIP] Caption too short")
            print()
            continue
        
        # Extract wines
        wines = extract_wines_from_text(caption)
        
        if wines:
            print(f"  [FOUND] {len(wines)} wine(s)!")
            for wine in wines:
                print(f"    - Name: {wine['name']}")
                print(f"      Supermarket: {wine['supermarket']}")
                print(f"      Type: {wine['wine_type']}")
                print(f"      Rating: {wine.get('rating', 'N/A')}")
                print(f"      Description: {wine.get('description', 'N/A')[:60]}...")
            total_wines += len(wines)
        else:
            print("  [NONE] No specific wines detected")
        
        print()
    
    # Summary
    print()
    print("#"*60)
    print("#  SUMMARY")
    print("#"*60)
    print()
    print(f"Videos processed: {len(videos)}")
    print(f"Wines found: {total_wines}")
    print()
    
    if total_wines > 0:
        print("[SUCCESS] TikTok oEmbed scraping works!")
        print()
        print("HOW THIS WORKS:")
        print("  1. Browse TikTok manually to find wine videos")
        print("  2. Copy video URLs")
        print("  3. Use oEmbed API to get descriptions")
        print("  4. Extract wine data with GPT")
        print()
        print("BENEFITS:")
        print("  - No login required")
        print("  - No bot detection")
        print("  - Simple and reliable")
        print("  - Same method as downr.org!")
    else:
        print("[INFO] No wines extracted")
        print("Try different videos or refine extraction prompts")
    
    print()


if __name__ == "__main__":
    test_tiktok_oembed_pipeline()

