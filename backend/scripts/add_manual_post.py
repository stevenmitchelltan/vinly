"""
Manually add TikTok posts to the database.

Usage:
    python scripts/add_manual_post.py <url1> <url2> ...
    python scripts/add_manual_post.py --file urls.txt

This script:
1. Downloads the TikTok video
2. Transcribes the audio with Whisper
3. Extracts wine data using LLM
4. Uses signal word detection to find optimal frame times
5. Extracts frames and uploads to Cloudinary
6. Saves wines to MongoDB
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timezone

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio
from app.services.wine_extractor import extract_wines_from_caption_and_transcription
from app.services.frame_extractor import extract_frames_at_times
from app.services.wine_timing import find_wine_mention_with_signal, get_optimal_frame_times, get_fallback_frame_times
from app.services.cloudinary_upload import upload_wine_image


async def process_tiktok_url(db, tiktok_url: str) -> int:
    """
    Process a single TikTok URL and add wines to database.
    
    Returns:
        Number of wines added
    """
    print(f"\n{'='*70}")
    print(f"Processing: {tiktok_url}")
    print(f"{'='*70}")
    
    try:
        # 1. Fetch video metadata
        print("📱 Fetching video metadata...")
        scraper = TikTokOEmbedScraper()
        video_data = scraper.get_video_data(tiktok_url)
        
        if not video_data:
            print("❌ Failed to fetch TikTok video data")
            return 0
        
        caption = video_data.get("caption", "")
        author = video_data.get("author_name", "unknown")
        print(f"✓ Video by @{author}")
        print(f"  Caption: {caption[:100]}...")
        
        # 2. Download video (both audio for transcription and full video for frames)
        print("\n📥 Downloading video...")
        downloader = TikTokVideoDownloader()
        
        # Download audio for transcription
        audio_result = downloader.download_video_audio(tiktok_url)
        if not audio_result:
            print("❌ Failed to download audio")
            return 0
        audio_path, post_date = audio_result
        print(f"✓ Downloaded audio: {audio_path}")
        
        # Download full video for frame extraction
        video_path = downloader.download_full_video(tiktok_url)
        if not video_path:
            print("❌ Failed to download video")
            return 0
        print(f"✓ Downloaded video: {video_path}")
        
        # 3. Transcribe audio
        print("\n🎤 Transcribing audio with Whisper...")
        transcription_result = transcribe_video_audio(audio_path)
        
        if not transcription_result or transcription_result.get("status") != "success":
            print("❌ Transcription failed")
            return 0
        
        transcription_text = transcription_result.get("text", "")
        segments = transcription_result.get("segments", [])
        print(f"✓ Transcribed {len(segments)} segments")
        print(f"  Text preview: {transcription_text[:150]}...")
        
        # 4. Extract wines
        print("\n🍷 Extracting wine data...")
        wines = extract_wines_from_caption_and_transcription(caption, transcription_text)
        
        if not wines:
            print("⚠️  No wines found in this video")
            return 0
        
        print(f"✓ Found {len(wines)} wine(s)")
        for wine in wines:
            print(f"  - {wine['name']} ({wine['supermarket']}, {wine['wine_type']})")
        
        wines_added = 0
        
        # 5. Process each wine
        for i, wine_data in enumerate(wines, 1):
            print(f"\n📦 Processing wine {i}/{len(wines)}: {wine_data['name']}")
            
            # Check if this video already has a wine (one wine per video)
            # Using post_url as unique identifier allows safe editing of all fields
            existing = await db.wines.find_one({
                "post_url": tiktok_url
            })
            
            if existing:
                print(f"  ⚠️  Already in database, skipping")
                continue
            
            # Find optimal frame times using signal words
            wine_name = wine_data["name"]
            print(f"  🔍 Finding optimal frames using signal words...")
            timestamp, method = find_wine_mention_with_signal(wine_name, segments)
            
            if timestamp:
                print(f"  ✓ Found mention at {timestamp:.1f}s (method: {method})")
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_optimal_frame_times(timestamp, video_duration)
            else:
                print(f"  ⚠️  Wine not found in transcription, using fallback")
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_fallback_frame_times(video_duration)
            
            print(f"  📸 Extracting {len(frame_times)} frames at: {[f'{t:.1f}s' for t in frame_times]}")
            
            # Extract frames
            frame_paths = extract_frames_at_times(video_path, frame_times)
            print(f"  ✓ Extracted {len(frame_paths)} frames")
            
            # Upload to Cloudinary
            print(f"  ☁️  Uploading to Cloudinary...")
            # Generate a temporary wine_id for uploads (will be replaced by MongoDB _id)
            import hashlib
            temp_wine_id = hashlib.md5(f"{tiktok_url}_{wine_data['name']}".encode()).hexdigest()[:16]
            
            image_urls = []
            for j, frame_path in enumerate(frame_paths):
                cloudinary_url = upload_wine_image(frame_path, temp_wine_id, j)
                if cloudinary_url:
                    image_urls.append(cloudinary_url)
                    print(f"    ✓ Uploaded frame {j+1}/{len(frame_paths)}")
                else:
                    print(f"    ❌ Failed to upload frame {j+1}")
            
            if not image_urls:
                print(f"  ❌ No images uploaded, skipping wine")
                continue
            
            # Save to database
            wine_doc = {
                "name": wine_data["name"],
                "supermarket": wine_data["supermarket"],
                "wine_type": wine_data["wine_type"],
                "image_urls": image_urls,
                "rating": wine_data.get("rating"),
                "description": wine_data.get("description"),
                "influencer_source": f"{author}_tiktok",
                "post_url": tiktok_url,
                "date_found": datetime.now(timezone.utc),
                "in_stock": None,
                "last_checked": None
            }
            
            await db.wines.insert_one(wine_doc)
            wines_added += 1
            print(f"  ✅ Added to database!")
        
        return wines_added
        
    except Exception as e:
        print(f"❌ Error processing URL: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0


async def main():
    """Main function"""
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python scripts/add_manual_post.py <url1> <url2> ...")
        print("  python scripts/add_manual_post.py --file urls.txt")
        print("\nExample:")
        print("  python scripts/add_manual_post.py https://www.tiktok.com/@user/video/123456")
        sys.exit(1)
    
    # Parse arguments
    urls = []
    
    if sys.argv[1] == "--file":
        # Read URLs from file
        if len(sys.argv) < 3:
            print("Error: Please provide a file path")
            sys.exit(1)
        
        file_path = sys.argv[2]
        try:
            with open(file_path, 'r') as f:
                urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        except FileNotFoundError:
            print(f"Error: File not found: {file_path}")
            sys.exit(1)
    else:
        # URLs provided as arguments
        urls = sys.argv[1:]
    
    if not urls:
        print("Error: No URLs provided")
        sys.exit(1)
    
    print("\n" + "="*70)
    print("  MANUAL TIKTOK POST PROCESSOR")
    print("="*70)
    print(f"Processing {len(urls)} URL(s)")
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    total_wines_added = 0
    
    # Process each URL
    for url in urls:
        wines_added = await process_tiktok_url(db, url)
        total_wines_added += wines_added
    
    # Summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    print(f"URLs processed: {len(urls)}")
    print(f"Wines added: {total_wines_added}")
    print("="*70)
    
    if total_wines_added > 0:
        print("\n💡 Next steps:")
        print("  1. Run: docker-compose exec backend python scripts/export_to_json.py")
        print("  2. Commit docs/wines.json and push to deploy")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())

