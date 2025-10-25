"""
Test the filter on real TikTok data to see what it's checking
Shows full captions and filter results
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from scripts.smart_scraper import is_supermarket_video


async def test_filter_on_real_data():
    """
    Test filter on actual processed videos to see what it's checking
    """
    
    print("\n" + "="*70)
    print("  FILTER TEST ON REAL TIKTOK DATA")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Get sample of processed videos
    print("Fetching 20 sample videos from database...")
    print()
    
    videos = []
    async for video in db.processed_videos.find().limit(20):
        videos.append(video)
    
    print(f"Testing filter on {len(videos)} videos...")
    print()
    print("="*70)
    
    passed = 0
    filtered = 0
    
    for i, video in enumerate(videos, 1):
        caption = video.get("caption", "")
        video_url = video.get("video_url", "")
        was_wine_content = video.get("is_wine_content", False)
        
        # Test current filter
        filter_result = is_supermarket_video(caption)
        
        # Clean caption for display
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        
        print(f"\n{i}. VIDEO TEST")
        print("-"*70)
        print(f"URL: {video_url.split('/')[-1]}")
        print(f"\nFULL CAPTION:")
        print(f"  {caption_clean}")
        print(f"\nCaption length: {len(caption)} characters")
        print(f"\nFILTER RESULT: {'PASS (sends to LLM)' if filter_result else 'FILTERED OUT (saves GPT cost)'}")
        print(f"Database says wine content: {was_wine_content}")
        
        if filter_result:
            passed += 1
            print("Status: [SENT TO LLM] [PASS]")
        else:
            filtered += 1
            print("Status: [FILTERED OUT] [SKIP]")
        
        print("="*70)
    
    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"Total videos tested: {len(videos)}")
    print(f"Passed filter (sent to LLM): {passed} ({passed/len(videos)*100:.1f}%)")
    print(f"Filtered out (saved GPT): {filtered} ({filtered/len(videos)*100:.1f}%)")
    print()
    
    # Check what the filter is actually looking for
    from app.utils.config_loader import config
    supermarket_keywords = config.get_all_supermarket_keywords()
    
    print("FILTER IS CHECKING FOR:")
    print(f"  Supermarket keywords: {len(supermarket_keywords)} terms")
    print(f"  Examples: {list(supermarket_keywords)[:10]}")
    print()
    
    # Find examples of filtered content
    print("="*70)
    print("EXAMPLES OF FILTERED OUT CONTENT")
    print("="*70)
    
    filtered_examples = [v for v in videos if not is_supermarket_video(v.get("caption", ""))][:5]
    
    for i, video in enumerate(filtered_examples, 1):
        caption = video.get("caption", "")
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        print(f"\n{i}. {caption_clean[:100]}...")
    
    print()
    print("="*70)
    print("EXAMPLES OF PASSED CONTENT")
    print("="*70)
    
    passed_examples = [v for v in videos if is_supermarket_video(v.get("caption", ""))][:5]
    
    for i, video in enumerate(passed_examples, 1):
        caption = video.get("caption", "")
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        print(f"\n{i}. {caption_clean[:100]}...")
        
        # Show which keyword matched
        caption_lower = caption.lower()
        matched_keywords = [kw for kw in supermarket_keywords if kw.lower() in caption_lower]
        if matched_keywords:
            print(f"   Matched keywords: {matched_keywords[:3]}")
    
    print()
    
    client.close()


if __name__ == "__main__":
    asyncio.run(test_filter_on_real_data())

