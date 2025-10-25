"""
Test script to manually test the scraping pipeline
Run this to verify everything works before deploying
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.scrapers.instagram_scraper import InstagramScraper
from app.services.transcription import transcribe_video
from app.services.wine_extractor import extract_wines_from_text
from app.services.image_handler import extract_image_from_post


async def test_scraping_pipeline():
    """Test the complete scraping pipeline"""
    
    print("🧪 Testing Vinly Scraping Pipeline\n")
    
    # Test 1: Instagram Scraper
    print("1️⃣ Testing Instagram Scraper...")
    scraper = InstagramScraper()
    
    test_handle = "wijnconsulent"  # Replace with actual influencer
    print(f"   Scraping @{test_handle}...")
    
    try:
        scraper.login()
        posts = scraper.scrape_profile(test_handle, days_back=3)
        print(f"   ✅ Found {len(posts)} posts")
        
        if posts:
            test_post = posts[0]
            print(f"   📝 Caption preview: {test_post['caption'][:100]}...")
            print(f"   📁 Media files: {len(test_post['media_files'])}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 2: Wine Extraction
    print("\n2️⃣ Testing Wine Extraction...")
    test_text = """
    Vandaag heb ik een geweldige Malbec gevonden bij Albert Heijn!
    De AH Excellent Malbec 2022 voor €8,99 is echt een aanrader.
    Een volle rode wijn met mooie fruitige tonen. Ik geef het een 8/10.
    """
    
    try:
        wines = extract_wines_from_text(test_text)
        print(f"   ✅ Extracted {len(wines)} wines")
        
        for wine in wines:
            print(f"   🍷 {wine['name']} - {wine['supermarket']} ({wine['wine_type']})")
            print(f"      Rating: {wine.get('rating', 'N/A')}")
    
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Video Transcription (only if video exists)
    print("\n3️⃣ Testing Video Transcription...")
    video_file = None
    
    if posts and posts[0]["is_video"] and posts[0]["media_files"]:
        video_file = next((f for f in posts[0]["media_files"] if f.endswith('.mp4')), None)
    
    if video_file:
        try:
            print(f"   Transcribing {video_file}...")
            transcript = transcribe_video(video_file)
            print(f"   ✅ Transcript: {transcript[:200]}...")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print("   ⏭️  Skipped (no video found)")
    
    # Test 4: Image Extraction
    print("\n4️⃣ Testing Image Extraction...")
    
    if posts and posts[0]["media_files"]:
        try:
            image = extract_image_from_post(posts[0]["media_files"])
            print(f"   ✅ Extracted image: {image}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print("   ⏭️  Skipped (no media found)")
    
    # Cleanup
    print("\n🧹 Cleaning up...")
    scraper.cleanup_temp_files()
    print("   ✅ Done")
    
    print("\n✨ Pipeline test complete!")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  VINLY SCRAPING PIPELINE TEST")
    print("="*60 + "\n")
    
    asyncio.run(test_scraping_pipeline())

