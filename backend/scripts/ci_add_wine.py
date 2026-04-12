"""
Add a wine from a TikTok URL without MongoDB.
Designed for GitHub Actions CI — reads/writes docs/wines.json directly.

Usage:
    python scripts/ci_add_wine.py <tiktok_url>
"""
import sys
import os
import json
import uuid
import hashlib
from pathlib import Path
from datetime import datetime, timezone

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from app.services.video_downloader import TikTokVideoDownloader
from app.services.transcription import transcribe_video_audio
from app.services.wine_extractor import extract_wines_from_caption_and_transcription
from app.services.frame_extractor import extract_frames_at_times
from app.services.wine_timing import find_wine_mention_with_signal, get_optimal_frame_times, get_fallback_frame_times
from app.services.cloudinary_upload import upload_wine_image

WINES_JSON = Path(__file__).parent.parent.parent / "docs" / "wines.json"


def load_wines() -> list:
    if WINES_JSON.exists():
        with open(WINES_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_wines(wines: list):
    WINES_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(WINES_JSON, "w", encoding="utf-8") as f:
        json.dump(wines, f, indent=2, ensure_ascii=False)


def process_url(tiktok_url: str) -> int:
    """Process a single TikTok URL. Returns number of wines added."""
    print(f"\n{'='*70}")
    print(f"Processing: {tiktok_url}")
    print(f"{'='*70}")

    wines = load_wines()

    # Duplicate check
    existing_urls = {w.get("post_url") for w in wines}
    if tiktok_url in existing_urls:
        print("Already in wines.json, skipping.")
        return 0

    # 1. Fetch metadata
    print("Fetching video metadata...")
    scraper = TikTokOEmbedScraper()
    video_data = scraper.get_video_data(tiktok_url)
    if not video_data:
        print("Failed to fetch TikTok video data")
        return 0

    caption = video_data.get("caption", "")
    author = video_data.get("author_name", "unknown")
    print(f"Video by @{author}")
    print(f"  Caption: {caption[:100]}...")

    # 2. Download audio + video
    print("\nDownloading video...")
    downloader = TikTokVideoDownloader()

    audio_result = downloader.download_video_audio(tiktok_url)
    if not audio_result:
        print("Failed to download audio")
        return 0
    audio_path, post_date = audio_result
    print(f"Downloaded audio: {audio_path}")

    video_path = downloader.download_full_video(tiktok_url)
    if not video_path:
        print("Failed to download video")
        return 0
    print(f"Downloaded video: {video_path}")

    # 3. Transcribe
    print("\nTranscribing audio with Whisper...")
    transcription_result = transcribe_video_audio(audio_path)
    if not transcription_result or transcription_result.get("status") != "success":
        print("Transcription failed")
        return 0

    transcription_text = transcription_result.get("text", "")
    segments = transcription_result.get("segments", [])
    print(f"Transcribed {len(segments)} segments")
    print(f"  Text preview: {transcription_text[:150]}...")

    # 4. Extract wines
    print("\nExtracting wine data...")
    extracted = extract_wines_from_caption_and_transcription(caption, transcription_text)
    if not extracted:
        print("No wines found in this video")
        return 0

    print(f"Found {len(extracted)} wine(s)")
    for w in extracted:
        print(f"  - {w['name']} ({w['supermarket']}, {w['wine_type']})")

    wines_added = 0

    for i, wine_data in enumerate(extracted, 1):
        print(f"\nProcessing wine {i}/{len(extracted)}: {wine_data['name']}")

        # 5. Frame extraction
        wine_name = wine_data["name"]
        print("  Finding optimal frames...")
        timestamp, method = find_wine_mention_with_signal(wine_name, segments)

        if timestamp:
            print(f"  Found mention at {timestamp:.1f}s (method: {method})")
            video_duration = segments[-1]["end"] if segments else 30.0
            frame_times = get_optimal_frame_times(timestamp, video_duration)
        else:
            print("  Wine not found in transcription, using fallback")
            video_duration = segments[-1]["end"] if segments else 30.0
            frame_times = get_fallback_frame_times(video_duration)

        print(f"  Extracting {len(frame_times)} frames at: {[f'{t:.1f}s' for t in frame_times]}")
        frame_paths = extract_frames_at_times(video_path, frame_times)
        print(f"  Extracted {len(frame_paths)} frames")

        # 6. Upload to Cloudinary
        print("  Uploading to Cloudinary...")
        temp_wine_id = hashlib.md5(f"{tiktok_url}_{wine_name}".encode()).hexdigest()[:16]

        image_urls = []
        for j, frame_path in enumerate(frame_paths):
            url = upload_wine_image(frame_path, temp_wine_id, j)
            if url:
                image_urls.append(url)
                print(f"    Uploaded frame {j+1}/{len(frame_paths)}")
            else:
                print(f"    Failed to upload frame {j+1}")

        if not image_urls:
            print("  No images uploaded, skipping wine")
            continue

        # 7. Append to wines list
        wine_id = uuid.uuid4().hex[:24]
        wine_entry = {
            "id": wine_id,
            "name": wine_data["name"],
            "supermarket": wine_data["supermarket"],
            "wine_type": wine_data["wine_type"],
            "price": None,
            "rating": wine_data.get("rating"),
            "description": wine_data.get("description"),
            "image_urls": image_urls,
            "post_url": tiktok_url,
            "influencer_source": f"{author}_tiktok",
            "date_found": datetime.now(timezone.utc).isoformat(),
        }

        wines.append(wine_entry)
        wines_added += 1
        print(f"  Added: {wine_data['name']}")

    if wines_added > 0:
        # Sort by date (newest first) to match export_to_json.py behavior
        wines.sort(key=lambda w: w.get("date_found") or "", reverse=True)
        save_wines(wines)
        print(f"\nSaved {wines_added} wine(s) to {WINES_JSON}")

    return wines_added


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/ci_add_wine.py <tiktok_url>")
        sys.exit(1)

    tiktok_url = sys.argv[1]
    wines_added = process_url(tiktok_url)

    print(f"\n{'='*70}")
    print(f"  Result: {wines_added} wine(s) added")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
