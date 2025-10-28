"""Test video frame extraction on a single wine"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio
from app.services.wine_timing import find_wine_mention_timestamp, get_optimal_frame_times
from app.services.frame_extractor import extract_frame, select_best_frame


async def main():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Get one wine for testing
    wine = await db.wines.find_one({})
    
    if not wine:
        print("No wines found")
        return
    
    wine_name = wine['name']
    video_url = wine['post_url']
    
    print(f"\nTesting frame extraction on:")
    print(f"  Wine: {wine_name}")
    print(f"  Video: {video_url}")
    print(f"\n{'='*70}\n")
    
    # Download audio and transcribe with segments
    downloader = TikTokVideoDownloader()
    dl_result = downloader.download_video_audio(video_url)
    
    if not dl_result or not isinstance(dl_result, tuple):
        print("[FAIL] Could not download audio")
        return
    
    audio_path, post_date = dl_result
    
    print("Transcribing to get segments...")
    transcription_result = transcribe_video_audio(audio_path)
    
    if transcription_result['status'] != 'success':
        print("[FAIL] Transcription failed")
        return
    
    segments = transcription_result.get('segments', [])
    duration = transcription_result['duration']
    
    print(f"Got {len(segments)} segments")
    
    if not segments:
        print("[FAIL] No segments in transcription")
        return
    
    # Find wine mention
    mention_time = find_wine_mention_timestamp(wine_name, segments)
    
    if mention_time:
        print(f"Wine mentioned at {mention_time:.1f}s")
        frame_times = get_optimal_frame_times(mention_time, duration)
    else:
        print(f"Wine not found in transcript, using fallback")
        from app.services.wine_timing import get_fallback_frame_times
        frame_times = get_fallback_frame_times(duration)
    
    print(f"Frame times to extract: {[f'{t:.1f}s' for t in frame_times]}")
    
    # Download full video
    print(f"\nDownloading full video...")
    video_path = downloader.download_full_video(video_url)
    
    if not video_path:
        print("[FAIL] Could not download video")
        return
    
    print(f"Video downloaded: {video_path}")
    
    # Extract frames
    frames_dir = Path(__file__).parent.parent / "temp" / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    extracted_frames = []
    for idx, timestamp in enumerate(frame_times):
        frame_path = frames_dir / f"test_{idx}.jpg"
        print(f"\nExtracting frame {idx+1} at {timestamp:.1f}s...")
        if extract_frame(video_path, timestamp, str(frame_path)):
            extracted_frames.append(str(frame_path))
            size_kb = frame_path.stat().st_size / 1024
            print(f"  Extracted: {frame_path.name} ({size_kb:.1f}KB)")
    
    # Select best
    best = select_best_frame(extracted_frames)
    
    if best:
        print(f"\n[SUCCESS] Best frame: {best}")
        print(f"\nYou can view the frame at: {best}")
    else:
        print(f"\n[FAIL] No valid frames")
    
    # Cleanup
    downloader.cleanup_audio_file(audio_path)
    downloader.cleanup_video_file(video_path)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())

