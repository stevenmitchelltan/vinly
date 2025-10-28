"""
Inspect and analyze the description keyword filtering
Shows which videos passed/failed the filter and why
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.config_loader import config
from scripts.smart_scraper import is_supermarket_wine_video


async def inspect_filtering():
    """
    Analyze filtering performance on processed videos
    """
    
    print("\n" + "="*70)
    print("  FILTERING INSPECTION REPORT")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Get all processed videos
    total_videos = await db.processed_videos.count_documents({})
    wine_videos = await db.processed_videos.count_documents({"is_wine_content": True})
    non_wine = total_videos - wine_videos
    
    print(f"Total processed videos: {total_videos}")
    print(f"  Wine-related: {wine_videos} ({wine_videos/total_videos*100:.1f}%)")
    print(f"  Filtered out: {non_wine} ({non_wine/total_videos*100:.1f}%)")
    print()
    
    # Show examples that PASSED the filter
    print("="*70)
    print("EXAMPLES THAT PASSED (Wine-related)")
    print("="*70)
    print()
    
    passed_examples = []
    async for video in db.processed_videos.find({"is_wine_content": True}).limit(10):
        caption = video.get("caption", "")
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        passed_examples.append({
            "caption": caption_clean[:120],
            "wines_found": video.get("wines_found", 0),
            "url": video.get("video_url", "")
        })
    
    for i, example in enumerate(passed_examples, 1):
        print(f"{i}. Caption: {example['caption']}...")
        print(f"   Wines found: {example['wines_found']}")
        print(f"   URL: {example['url']}")
        print()
    
    # Show examples that FAILED the filter
    print("="*70)
    print("EXAMPLES THAT FAILED (Filtered out)")
    print("="*70)
    print()
    
    failed_examples = []
    async for video in db.processed_videos.find({"is_wine_content": False}).limit(10):
        caption = video.get("caption", "")
        caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
        failed_examples.append({
            "caption": caption_clean[:120],
            "url": video.get("video_url", "")
        })
    
    for i, example in enumerate(failed_examples, 1):
        print(f"{i}. Caption: {example['caption']}...")
        print(f"   URL: {example['url']}")
        print()
    
    # Test current filter on examples
    print("="*70)
    print("FILTER ANALYSIS - Testing Keywords")
    print("="*70)
    print()
    
    # Get keyword configuration
    wine_keywords = config.wine_keywords.get("wine_keywords", [])
    supermarket_keywords = config.get_all_supermarket_keywords()
    recommendation_keywords = config.wine_keywords.get("recommendation_keywords", [])
    
    print(f"Wine keywords loaded: {len(wine_keywords)}")
    print(f"  Examples: {wine_keywords[:5]}")
    print()
    print(f"Supermarket keywords loaded: {len(supermarket_keywords)}")
    print(f"  Examples: {list(supermarket_keywords)[:5]}")
    print()
    print(f"Recommendation keywords: {len(recommendation_keywords)}")
    print(f"  Examples: {recommendation_keywords[:5]}")
    print()
    
    # Manual inspection: Check if filter would catch some examples
    print("="*70)
    print("MANUAL FILTER TEST")
    print("="*70)
    print()
    
    test_captions = []
    async for video in db.processed_videos.find().limit(20):
        caption = video.get("caption", "")
        is_wine = video.get("is_wine_content", False)
        test_captions.append((caption, is_wine))
    
    correct = 0
    false_positives = 0
    false_negatives = 0
    
    for caption, actual_is_wine in test_captions:
        predicted = is_supermarket_wine_video(caption)
        
        if predicted == actual_is_wine:
            correct += 1
        elif predicted and not actual_is_wine:
            false_positives += 1
            caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
            print(f"[FALSE POSITIVE] Marked as wine but isn't:")
            print(f"  {caption_clean[:100]}...")
            print()
        elif not predicted and actual_is_wine:
            false_negatives += 1
            caption_clean = caption.encode('ascii', 'ignore').decode('ascii')
            print(f"[FALSE NEGATIVE] Missed wine content:")
            print(f"  {caption_clean[:100]}...")
            print()
    
    print("="*70)
    print("ACCURACY REPORT")
    print("="*70)
    print()
    print(f"Sample size: {len(test_captions)} videos")
    print(f"Correct predictions: {correct}/{len(test_captions)} ({correct/len(test_captions)*100:.1f}%)")
    print(f"False positives: {false_positives} (marked as wine, but wasn't)")
    print(f"False negatives: {false_negatives} (missed actual wine content)")
    print()
    
    # Recommendations
    print("="*70)
    print("RECOMMENDATIONS")
    print("="*70)
    print()
    
    if false_negatives > 0:
        print(f"⚠️  {false_negatives} wine videos were missed!")
        print("   → Consider adding more keywords to wine_keywords.yaml")
        print()
    
    if false_positives > 0:
        print(f"⚠️  {false_positives} non-wine videos passed the filter")
        print("   → Consider making filter more strict")
        print()
    
    if false_negatives == 0 and false_positives == 0:
        print("✅ Filter is working perfectly on this sample!")
        print()
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(inspect_filtering())

