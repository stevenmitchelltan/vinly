"""
Find and add missed wine videos from TikTok profiles.

This script:
1. Rescans configured TikTok profiles to get all video URLs
2. Checks which URLs are NOT in the database yet
3. Processes ONLY the new URLs (efficient - no unnecessary downloads)
4. Uses the improved LLM prompt (including rosé normalization)

Usage:
    python scripts/find_and_add_missed_wines.py [--dry-run] [--profile USERNAME] [--max-videos N]
"""
import asyncio
import sys
import os
import argparse
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from playwright.async_api import async_playwright
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio
from app.services.wine_extractor import extract_wines_from_caption_and_transcription
from app.services.wine_timing import find_wine_mention_with_signal, get_optimal_frame_times, get_fallback_frame_times
from app.services.frame_extractor import extract_frames_at_times
from app.services.cloudinary_upload import upload_wine_image
import hashlib


async def get_video_urls_from_profile(username: str, max_videos: int = 100):
    """Get all video URLs from a TikTok profile using Playwright"""
    url = f"https://www.tiktok.com/@{username}"
    video_urls = []
    
    print(f"\n📱 Scanning @{username} profile...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Try JSON data first (most reliable)
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
            except Exception as e:
                print(f"  ⚠️  JSON extraction failed: {e}")
            
            # Fallback to DOM scraping if needed
            if not video_urls:
                print("  🔄 Using DOM scraping fallback...")
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
    
    print(f"  ✓ Found {len(video_urls)} videos on profile")
    return video_urls


async def get_existing_post_urls(db):
    """Get all post URLs already in database"""
    wines_collection = db.wines
    cursor = wines_collection.find({}, {"post_url": 1})
    existing_urls = set()
    
    async for wine in cursor:
        if wine.get("post_url"):
            existing_urls.add(wine["post_url"])
    
    return existing_urls


async def process_single_url(tiktok_url: str, db, dry_run: bool = False):
    """Process a single TikTok URL through the full pipeline"""
    
    if dry_run:
        print(f"  [DRY RUN] Would process: {tiktok_url}")
        return 0
    
    try:
        # 1. Get video metadata
        print(f"\n🎬 Processing: {tiktok_url}")
        scraper = TikTokOEmbedScraper()
        oembed_data = scraper.get_video_data(tiktok_url)
        
        if not oembed_data:
            print("  ❌ Failed to fetch video data")
            return 0
        
        # Convert oEmbed format to our video_data format
        video_data = {
            "caption": oembed_data.get("title", ""),
            "author_name": oembed_data.get("author_name", "unknown"),
            "thumbnail_url": oembed_data.get("thumbnail_url"),
        }
        
        caption = video_data.get("caption", "")
        author = video_data.get("author_name", "unknown")
        print(f"  ✓ Video by @{author}")
        
        # 2. Download video (both audio for transcription and full video for frames)
        downloader = TikTokVideoDownloader()
        
        # Download audio for transcription
        audio_result = downloader.download_video_audio(tiktok_url)
        if not audio_result:
            print("  ❌ Failed to download audio")
            return 0
        audio_path, post_date = audio_result
        
        # Download full video for frame extraction
        video_path = downloader.download_full_video(tiktok_url)
        if not video_path:
            print("  ❌ Failed to download video")
            return 0
        
        # 3. Transcribe audio
        print("  🎤 Transcribing...")
        transcription_result = transcribe_video_audio(audio_path)
        
        if not transcription_result or transcription_result.get("status") != "success":
            print("  ❌ Transcription failed")
            return 0
        
        transcription_text = transcription_result.get("text", "")
        segments = transcription_result.get("segments", [])
        
        # 4. Extract wines
        print("  🤖 Extracting wine data...")
        wines = extract_wines_from_caption_and_transcription(caption, transcription_text)
        
        if not wines:
            print("  ⚠️  No wines found in this video")
            return 0
        
        wines_added = 0
        
        for wine_data in wines:
            # Check if this video already has a wine (one wine per video)
            existing = await db.wines.find_one({
                "post_url": tiktok_url
            })
            
            if existing:
                print(f"  ⚠️  Wine already exists from this URL: {existing.get('name')}")
                continue
            
            # Find optimal frame times using signal words
            wine_name = wine_data["name"]
            timestamp, method = find_wine_mention_with_signal(wine_name, segments)
            
            if timestamp:
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_optimal_frame_times(timestamp, video_duration)
                print(f"  🔍 Found wine mention at {timestamp:.1f}s using: {method}")
            else:
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_fallback_frame_times(video_duration)
                print(f"  🔍 Using fallback frame times")
            
            # Extract frames
            print(f"  📸 Extracting {len(frame_times)} frames...")
            frame_paths = extract_frames_at_times(video_path, frame_times)
            
            # Upload to Cloudinary
            print(f"  ☁️  Uploading to Cloudinary...")
            temp_wine_id = hashlib.md5(f"{tiktok_url}_{wine_data['name']}".encode()).hexdigest()[:16]
            
            image_urls = []
            for i, frame_path in enumerate(frame_paths):
                cloudinary_url = upload_wine_image(frame_path, temp_wine_id, i)
                if cloudinary_url:
                    image_urls.append(cloudinary_url)
            
            if not image_urls:
                print(f"  ❌ No images uploaded")
                continue
            
            # Save to database
            wine_doc = {
                "name": wine_data["name"],
                "supermarket": wine_data["supermarket"],
                "wine_type": wine_data["wine_type"],
                "image_urls": image_urls,
                "rating": wine_data.get("rating"),
                "description": wine_data.get("description"),
                "influencer_source": video_data.get("author_name", "manual_add") + "_tiktok",
                "post_url": tiktok_url,
                "date_found": datetime.now(timezone.utc),
            }
            
            await db.wines.insert_one(wine_doc)
            wines_added += 1
            print(f"  ✅ Added: {wine_data['name']} ({wine_data['supermarket']})")
        
        return wines_added
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 0


async def main():
    parser = argparse.ArgumentParser(description='Find and add missed wine videos from TikTok profiles')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be processed without actually doing it')
    parser.add_argument('--profile', type=str, help='Process only this profile (e.g., pepijn.wijn)')
    parser.add_argument('--max-videos', type=int, default=100, help='Max videos to scan per profile (default: 100)')
    parser.add_argument('--auto-confirm', '-y', action='store_true', help='Skip confirmation prompt and start processing immediately')
    
    args = parser.parse_args()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Get list of profiles to scan (from config or default list)
    if args.profile:
        profiles = [args.profile]
    else:
        # Default profiles - you can customize this list
        profiles = [
            "pepijn.wijn",
            # Add more profiles here as needed
        ]
    
    print("=" * 60)
    print("🍷 FIND AND ADD MISSED WINES")
    print("=" * 60)
    
    if args.dry_run:
        print("⚠️  DRY RUN MODE - No actual processing will occur")
    
    # Get existing URLs from database
    print("\n📊 Checking database...")
    existing_urls = await get_existing_post_urls(db)
    print(f"  ✓ Found {len(existing_urls)} wines already in database")
    
    # Scan each profile for new URLs
    all_new_urls = []
    
    for username in profiles:
        profile_urls = await get_video_urls_from_profile(username, max_videos=args.max_videos)
        
        # Filter to only NEW urls
        new_urls = [url for url in profile_urls if url not in existing_urls]
        
        print(f"\n  📊 @{username}:")
        print(f"     Total videos found: {len(profile_urls)}")
        print(f"     Already in database: {len(profile_urls) - len(new_urls)}")
        print(f"     NEW videos to process: {len(new_urls)}")
        
        all_new_urls.extend(new_urls)
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📋 SUMMARY:")
    print(f"   Total profiles scanned: {len(profiles)}")
    print(f"   Total NEW URLs found: {len(all_new_urls)}")
    print("=" * 60)
    
    if not all_new_urls:
        print("\n✅ No new videos to process! All caught up.")
        return
    
    if args.dry_run:
        print("\n🔍 NEW URLs that would be processed:")
        for url in all_new_urls:
            print(f"   - {url}")
        print(f"\nRun without --dry-run to process these {len(all_new_urls)} videos")
        return
    
    # Ask for confirmation (unless auto-confirm is enabled)
    if not args.auto_confirm:
        print(f"\n⚠️  About to process {len(all_new_urls)} new videos.")
        print("   This will download, transcribe, extract, and upload images.")
        response = input("   Continue? (y/N): ")
        
        if response.lower() != 'y':
            print("Cancelled.")
            return
    else:
        print(f"\n🚀 Auto-confirm enabled. Processing {len(all_new_urls)} new videos...")
    
    # Process each new URL
    print("\n🚀 Processing new videos...\n")
    total_wines_added = 0
    
    for i, url in enumerate(all_new_urls, 1):
        print(f"\n[{i}/{len(all_new_urls)}]")
        wines_added = await process_single_url(url, db, dry_run=False)
        total_wines_added += wines_added
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 COMPLETE!")
    print(f"   Processed: {len(all_new_urls)} videos")
    print(f"   Added: {total_wines_added} wines")
    print("=" * 60)
    
    print("\n📝 Next steps:")
    print("   1. Run: docker-compose exec backend python scripts/export_to_json.py")
    print("   2. Commit and push to deploy to GitHub Pages")


if __name__ == "__main__":
    asyncio.run(main())

