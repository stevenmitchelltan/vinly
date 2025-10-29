"""
Re-extract wine images using improved signal word detection.

This script will:
1. Find wines with existing images
2. Re-transcribe videos (or use cached transcriptions)
3. Use new signal word logic to find better frame timestamps
4. Extract new frames
5. Update wine records with better images

Run: python backend/scripts/re_extract_with_signals.py --limit 5
"""
import asyncio
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import argparse

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.services.transcription import transcribe_video_audio
from app.services.video_downloader import TikTokVideoDownloader
from app.services.wine_timing import find_wine_mention_with_signal, get_optimal_frame_times, get_fallback_frame_times
from app.services.frame_extractor import extract_frame, select_best_frame
from app.services.cloudinary_upload import upload_wine_image
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def re_extract_wine_images(limit: int = None, dry_run: bool = False):
    """Re-extract images with improved signal word detection."""
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    wines_collection = db.wines
    
    downloader = TikTokVideoDownloader()
    
    # Find wines with images (candidates for improvement)
    query = {"image_urls": {"$exists": True, "$ne": []}}
    
    wines_cursor = wines_collection.find(query)
    if limit:
        wines_cursor = wines_cursor.limit(limit)
    
    wines = await wines_cursor.to_list(length=None)
    
    if not wines:
        logger.info("No wines found to re-extract")
        client.close()
        return
    
    logger.info(f"Found {len(wines)} wines to potentially improve")
    logger.info(f"Dry run: {dry_run}")
    
    improved = 0
    failed = 0
    skipped = 0
    
    for idx, wine in enumerate(wines, 1):
        wine_id = str(wine['_id'])
        wine_name = wine.get('name', 'Unknown')
        post_url = wine.get('post_url')
        
        logger.info(f"\n{'='*80}")
        logger.info(f"[{idx}/{len(wines)}] Processing: {wine_name}")
        logger.info(f"ID: {wine_id}")
        logger.info(f"Current images: {len(wine.get('image_urls', []))}")
        
        if not post_url:
            logger.warning("No post URL, skipping")
            skipped += 1
            continue
        
        try:
            # Step 1: Download audio for transcription
            logger.info("Step 1: Downloading audio...")
            result = downloader.download_video_audio(post_url)
            
            if not result:
                logger.error("Failed to download audio")
                failed += 1
                continue
            
            audio_path, _ = result  # Unpack tuple (audio_path, video_path)
            
            # Step 2: Transcribe with Whisper
            logger.info("Step 2: Transcribing audio...")
            transcription_result = transcribe_video_audio(audio_path)
            
            if not transcription_result:
                logger.error("Failed to transcribe")
                downloader.cleanup_audio_file(audio_path)
                failed += 1
                continue
            
            segments = transcription_result.get('segments', [])
            duration = transcription_result.get('duration', 0)
            
            logger.info(f"Transcription: {len(segments)} segments, {duration:.1f}s duration")
            
            # Step 3: Find wine mention with signal words (NEW!)
            logger.info("Step 3: Finding wine mention with signal word detection...")
            mention_time, match_method = find_wine_mention_with_signal(wine_name, segments)
            
            if mention_time:
                logger.info(f"✨ Found wine at {mention_time:.1f}s (method: {match_method})")
                
                # Check if this is better than before (has signal word)
                if match_method and 'signal' in match_method:
                    logger.info(f"⭐ IMPROVED DETECTION! Using signal word match")
                    frame_times = get_optimal_frame_times(mention_time, duration)
                else:
                    logger.info(f"Standard detection (no signal word)")
                    frame_times = get_optimal_frame_times(mention_time, duration)
            else:
                logger.warning("Wine not found, using fallback")
                frame_times = get_fallback_frame_times(duration)
            
            logger.info(f"Frame times: {[f'{t:.1f}s' for t in frame_times]}")
            
            if dry_run:
                logger.info("DRY RUN - Would extract frames and upload")
                downloader.cleanup_audio_file(audio_path)
                continue
            
            # Step 4: Download full video
            logger.info("Step 4: Downloading full video...")
            video_path = downloader.download_full_video(post_url)
            
            if not video_path:
                logger.error("Failed to download video")
                downloader.cleanup_audio_file(audio_path)
                failed += 1
                continue
            
            # Step 5: Extract frames
            logger.info("Step 5: Extracting frames...")
            temp_dir = Path(__file__).parent.parent / "temp" / "re_extraction"
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            extracted_frames = []
            for frame_idx, timestamp in enumerate(frame_times):
                frame_path = temp_dir / f"{wine_id}_{frame_idx}.jpg"
                if extract_frame(video_path, timestamp, str(frame_path)):
                    extracted_frames.append(str(frame_path))
                    size_kb = frame_path.stat().st_size / 1024
                    logger.info(f"  Frame {frame_idx+1}: {timestamp:.1f}s ({size_kb:.1f}KB)")
            
            if not extracted_frames:
                logger.error("No frames extracted")
                downloader.cleanup_audio_file(audio_path)
                downloader.cleanup_video_file(video_path)
                failed += 1
                continue
            
            # Step 6: Upload to Cloudinary
            logger.info(f"Step 6: Uploading {len(extracted_frames)} frames to Cloudinary...")
            cloudinary_urls = []
            
            for frame_idx, frame_path in enumerate(extracted_frames):
                url = upload_wine_image(Path(frame_path), wine_id, frame_idx)
                if url:
                    cloudinary_urls.append(url)
                    logger.info(f"  Uploaded frame {frame_idx+1}: {url[:60]}...")
            
            if not cloudinary_urls:
                logger.error("Failed to upload any frames")
                downloader.cleanup_audio_file(audio_path)
                downloader.cleanup_video_file(video_path)
                for frame_path in extracted_frames:
                    Path(frame_path).unlink(missing_ok=True)
                failed += 1
                continue
            
            # Step 7: Update database
            logger.info(f"Step 7: Updating wine with {len(cloudinary_urls)} new images...")
            await wines_collection.update_one(
                {"_id": wine['_id']},
                {"$set": {"image_urls": cloudinary_urls}}
            )
            
            logger.info(f"✅ SUCCESS! Replaced {len(wine.get('image_urls', []))} old images with {len(cloudinary_urls)} new images")
            improved += 1
            
            # Cleanup
            downloader.cleanup_audio_file(audio_path)
            downloader.cleanup_video_file(video_path)
            for frame_path in extracted_frames:
                Path(frame_path).unlink(missing_ok=True)
        
        except Exception as e:
            logger.error(f"Error processing wine: {e}", exc_info=True)
            failed += 1
    
    # Summary
    logger.info(f"\n{'='*80}")
    logger.info(f"SUMMARY:")
    logger.info(f"  Improved: {improved}")
    logger.info(f"  Failed: {failed}")
    logger.info(f"  Skipped: {skipped}")
    logger.info(f"  Total: {len(wines)}")
    
    client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Re-extract wine images with improved signal word detection")
    parser.add_argument('--limit', type=int, help='Limit number of wines to process')
    parser.add_argument('--dry-run', action='store_true', help='Test without actually updating')
    
    args = parser.parse_args()
    
    asyncio.run(re_extract_wine_images(limit=args.limit, dry_run=args.dry_run))

