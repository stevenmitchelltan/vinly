"""
Enrich wines with bottle images extracted from TikTok videos.
Uses Whisper timestamps to find when wine is mentioned, then extracts frames.
Images are automatically uploaded to Cloudinary CDN.

Usage:
    python scripts/enrich_wine_images.py                 # Process all wines
    python scripts/enrich_wine_images.py pepijn.wijn     # Specific influencer
    python scripts/enrich_wine_images.py --limit 5       # Test on 5 wines
"""
import asyncio
import sys
import os
import shutil
from pathlib import Path
import argparse
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.video_downloader import TikTokVideoDownloader
from app.services.wine_timing import find_wine_mention_timestamp, get_optimal_frame_times, get_fallback_frame_times
from app.services.frame_extractor import extract_frame, select_best_frame
from app.services.cloudinary_upload import upload_wine_image


async def enrich_wine_images(username: str = None, limit: int = None):
    """
    Extract and assign bottle images to wines from their source videos.
    
    Args:
        username: Optional filter by influencer handle
        limit: Optional limit on number of wines to process
    """
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    try:
        # Build query for wines without images
        query = {"image_url": {"$in": [None, ""]}}
        if username:
            query["influencer_source"] = f"{username}_tiktok"
        
        total_wines = await db.wines.count_documents(query)
        
        if total_wines == 0:
            print("\n[INFO] No wines found that need images.")
            return
        
        print(f"\n{'='*70}")
        print(f"WINE IMAGE ENRICHMENT")
        print(f"{'='*70}")
        print(f"Total wines without images: {total_wines}")
        if username:
            print(f"Influencer filter: @{username}")
        if limit:
            print(f"Processing limit: {limit}")
        print(f"{'='*70}\n")
        
        # Fetch wines to process
        cursor = db.wines.find(query).limit(limit if limit else total_wines)
        wines = await cursor.to_list(length=limit or total_wines)
        
        # Create static images directory
        images_dir = Path(__file__).parent.parent / "static" / "wine_images"
        images_dir.mkdir(parents=True, exist_ok=True)
        
        # Create temp frames directory
        frames_dir = Path(__file__).parent.parent / "temp" / "frames"
        frames_dir.mkdir(parents=True, exist_ok=True)
        
        downloader = TikTokVideoDownloader()
        
        success_count = 0
        failed_count = 0
        
        for i, wine in enumerate(wines, 1):
            wine_id = str(wine['_id'])
            wine_name = wine.get('name', 'Unknown')
            supermarket = wine.get('supermarket', 'Unknown')
            video_url = wine.get('post_url')
            
            print(f"\n[{i}/{len(wines)}] Processing: {wine_name}")
            print(f"  Supermarket: {supermarket}")
            print(f"  Video: {video_url}")
            
            try:
                # Get transcription segments from processed_videos
                processed_video = await db.processed_videos.find_one({"video_url": video_url})
                
                if not processed_video:
                    print("  [SKIP] No processed video record found")
                    failed_count += 1
                    continue
                
                segments = processed_video.get('transcription_segments', [])
                duration = processed_video.get('audio_duration_seconds', 60)
                
                if not segments:
                    print("  [SKIP] No transcription segments available")
                    failed_count += 1
                    continue
                
                # Find when wine is mentioned
                mention_time = find_wine_mention_timestamp(wine_name, segments)
                
                if mention_time is not None:
                    print(f"  Found wine mention at {mention_time:.1f}s")
                    frame_times = get_optimal_frame_times(mention_time, duration)
                else:
                    print(f"  Wine not found in transcript, using fallback times")
                    frame_times = get_fallback_frame_times(duration)
                
                # Download full video
                video_path = downloader.download_full_video(video_url)
                
                if not video_path:
                    print("  [FAIL] Could not download video")
                    failed_count += 1
                    continue
                
                # Extract frames at optimal times
                extracted_frames = []
                for idx, timestamp in enumerate(frame_times):
                    frame_path = frames_dir / f"{wine_id}_{idx}.jpg"
                    if extract_frame(video_path, timestamp, str(frame_path)):
                        extracted_frames.append(str(frame_path))
                
                print(f"  Extracted {len(extracted_frames)} frames")
                
                # Select all valid frames (up to 6)
                valid_frames = []
                for frame_path in extracted_frames:
                    p = Path(frame_path)
                    if p.exists() and p.stat().st_size > 10000:  # > 10KB
                        valid_frames.append(frame_path)
                
                if not valid_frames:
                    print("  [FAIL] No valid frames extracted")
                    downloader.cleanup_video_file(video_path)
                    failed_count += 1
                    continue
                
                # Upload frames to Cloudinary and collect CDN URLs
                print(f"  [UPLOAD] Uploading {len(valid_frames)} images to Cloudinary...")
                saved_image_urls = []
                for idx, frame_path in enumerate(valid_frames):
                    cdn_url = upload_wine_image(Path(frame_path), wine_id, idx)
                    if cdn_url:
                        saved_image_urls.append(cdn_url)
                        print(f"    ✓ Image {idx+1}/{len(valid_frames)} uploaded")
                    else:
                        print(f"    ✗ Image {idx+1}/{len(valid_frames)} failed")
                
                if not saved_image_urls:
                    print("  [FAIL] No images uploaded successfully")
                    downloader.cleanup_video_file(video_path)
                    failed_count += 1
                    continue
                
                # Cleanup local frames (not needed after upload)
                for frame in extracted_frames:
                    if os.path.exists(frame):
                        os.remove(frame)
                
                # Update wine with image URLs array
                await db.wines.update_one(
                    {"_id": wine['_id']},
                    {"$set": {"image_urls": saved_image_urls}}
                )
                
                print(f"  [SUCCESS] Saved {len(saved_image_urls)} images")
                success_count += 1
                
                # Cleanup video
                downloader.cleanup_video_file(video_path)
                
            except Exception as e:
                print(f"  [ERROR] {e}")
                failed_count += 1
        
        # Summary
        print(f"\n{'='*70}")
        print(f"IMAGE ENRICHMENT COMPLETE")
        print(f"{'='*70}")
        print(f"Processed: {len(wines)} wines")
        print(f"Success: {success_count} wines got images")
        print(f"Failed: {failed_count}")
        print(f"Success rate: {(success_count/len(wines)*100):.1f}%")
        print(f"{'='*70}\n")
        
    finally:
        client.close()


def main():
    parser = argparse.ArgumentParser(
        description="Enrich wines with bottle images from videos"
    )
    parser.add_argument(
        "username",
        nargs='?',
        help="Filter by influencer handle (e.g., pepijn.wijn)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of wines to process"
    )
    
    args = parser.parse_args()
    
    asyncio.run(enrich_wine_images(
        username=args.username,
        limit=args.limit
    ))


if __name__ == "__main__":
    main()

