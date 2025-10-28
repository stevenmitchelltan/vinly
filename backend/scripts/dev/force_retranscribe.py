"""
Force re-transcription of already processed videos to refresh ASR with new settings.

Usage:
  python scripts/force_retranscribe.py [handle] [limit]
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.transcription import transcribe_audio_file
from app.services.video_downloader import TikTokVideoDownloader


async def force_retranscribe(username: str = None, limit: int = 20):
    print("\n" + "="*70)
    print("  FORCE RE-TRANSCRIPTION")
    print("="*70)
    print()

    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly

    query = {"is_wine_content": True}
    if username:
        query["tiktok_handle"] = username

    # Prefer most recent videos first
    cursor = db.processed_videos.find(query).sort("processed_date", -1).limit(limit)
    videos = [v async for v in cursor]

    if not videos:
        print("[INFO] No videos found to re-transcribe.")
        client.close()
        return

    print(f"Selected {len(videos)} videos for re-transcription")

    downloader = TikTokVideoDownloader()
    success = 0
    failed = 0
    total_duration = 0.0

    for i, video in enumerate(videos, 1):
        video_url = video.get("video_url")
        video_id = video_url.split('/')[-1] if video_url else "unknown"
        print(f"\n{i}/{len(videos)}. {video_id}")
        print(f"    URL: {video_url}")

        # Download audio
        dl_result = downloader.download_video_audio(video_url)
        if isinstance(dl_result, tuple):
            audio_path, post_date = dl_result
        else:
            audio_path, post_date = dl_result, None

        if not audio_path:
            print("    [FAILED] Could not download audio")
            failed += 1
            continue

        # Transcribe
        tr = transcribe_audio_file(audio_path, retry_count=1)
        total_duration += tr.get('duration', 0.0) or 0.0

        if tr.get('status') == 'success':
            # Update DB
            update_doc = {
                "transcription": tr['text'],
                "transcription_status": "success",
                "transcription_date": datetime.now(timezone.utc),
                "audio_duration_seconds": tr['duration'],
                "asr_metrics": tr.get('metrics', {}),
                "transcription_error": None
            }
            if post_date:
                update_doc["post_date"] = post_date
            await db.processed_videos.update_one(
                {"video_url": video_url},
                {"$set": update_doc, "$unset": {"transcription_prev": ""}}
            )
            print("    [SUCCESS] Re-transcribed")
            success += 1
        else:
            print("    [FAILED] Transcription error: " + (tr.get('error') or ''))
            failed += 1

        # Cleanup
        try:
            downloader.cleanup_audio_file(audio_path)
        except Exception:
            pass

    print("\n" + "="*70)
    print("RE-TRANSCRIPTION COMPLETE")
    print("="*70)
    print(f"Processed: {len(videos)}  Success: {success}  Failed: {failed}")
    print(f"Total audio duration: {total_duration/60.0:.1f} minutes")
    client.close()


if __name__ == "__main__":
    handle = sys.argv[1] if len(sys.argv) > 1 else None
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    asyncio.run(force_retranscribe(username=handle, limit=limit))


