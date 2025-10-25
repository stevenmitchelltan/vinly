# Video Transcription Guide

## Overview

The transcription system enhances wine extraction by combining TikTok video captions with audio transcriptions. This significantly improves wine data quality and extraction success rates.

## Architecture

```
Workflow:
1. Smart Scraper → Finds supermarket videos
2. Batch Transcription → Downloads & transcribes audio
3. Wine Extraction → Uses caption + transcription
```

## Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install System Dependencies

**ffmpeg** is required for audio extraction:

**Windows:**
```bash
# Using chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

## Usage

### Step 1: Run Smart Scraper

First, scrape videos and filter for supermarket content:

```bash
cd backend
python scripts/smart_scraper.py pepijn.wijn
```

This creates `processed_videos` entries with `transcription_status: pending`

### Step 2: Transcribe Videos

Process all pending transcriptions:

```bash
# Transcribe all pending videos
python scripts/transcribe_videos.py

# Or transcribe specific influencer only
python scripts/transcribe_videos.py pepijn.wijn
```

**What happens:**
1. Downloads video audio using yt-dlp
2. Transcribes with OpenAI Whisper API
3. Stores transcription in database
4. Marks as success/failed
5. Calculates costs

### Step 3: Extract Wines (Again)

Re-run the scraper to extract wines using new transcriptions:

```bash
python scripts/smart_scraper.py pepijn.wijn
```

Now it will use **caption + transcription** for better extraction!

### Step 4: Monitor Costs

Check transcription costs and success rates:

```bash
python scripts/report_transcription_costs.py
```

## Database Schema

### processed_videos Collection

New fields added:

```javascript
{
  video_url: String,
  caption: String,
  
  // NEW transcription fields
  transcription: String,                 // Full audio transcription
  transcription_status: String,          // 'success', 'failed', 'pending'
  transcription_date: Date,              // When transcribed
  transcription_error: String,           // Error message if failed
  audio_duration_seconds: Number,        // For cost tracking
  
  // Existing fields
  is_wine_content: Boolean,
  wines_found: Number,
  // ...
}
```

## Costs

### Per Video

- **Audio download:** Free (yt-dlp)
- **Whisper transcription:** $0.006/minute
- **GPT extraction:** $0.001

**Average:** ~$0.007 per video (assuming 60s videos)

### Example Costs

**241 videos from @pepijn.wijn:**
- Total duration: ~241 minutes (4 hours)
- Whisper: $1.45
- GPT: $0.24
- **Total: $1.69**

**Monthly (10 influencers, weekly scans):**
- ~$67.60/month

## Success Metrics

### Expected Improvements

**Without Transcription (Caption Only):**
- Success rate: ~10%
- 241 videos → ~24 wines

**With Transcription:**
- Success rate: ~30-50%
- 241 videos → ~72-120 wines
- **3-5x more wines extracted!**

## Troubleshooting

### "ffmpeg not found"

Install ffmpeg system dependency (see Installation section)

### "yt-dlp download failed"

**Possible causes:**
- TikTok rate limiting
- Video is private/deleted
- Network issues

**Solution:** Retry later or skip the video

### "Whisper API error"

**Check:**
- OpenAI API key is valid
- You have credits remaining
- Audio file is < 25MB

### "Transcription success but no text"

**Possible causes:**
- Video has no audio
- Music only, no speech
- Audio quality too poor

**Status:** Marked as "success" but empty transcription (fallback to caption)

## API Usage Limits

### OpenAI Whisper

- **File size limit:** 25 MB
- **Duration limit:** ~2 hours per file
- **Rate limits:** Tier-dependent

**TikTok videos:** Usually 15-180 seconds, well under limits

## Best Practices

### 1. Batch Processing

Transcribe in batches to manage costs:

```bash
# Transcribe only recent videos
python scripts/transcribe_videos.py pepijn.wijn
```

### 2. Monitor Costs

Run cost report regularly:

```bash
python scripts/report_transcription_costs.py
```

### 3. Retry Failures

Failed transcriptions can be retried:

```bash
# They'll automatically retry on next run
python scripts/transcribe_videos.py
```

### 4. Cleanup

Temp audio files are automatically deleted after transcription.

Manual cleanup if needed:

```bash
rm -rf backend/temp/videos/*
```

## Configuration

Edit `backend/config/scraping_settings.yaml`:

```yaml
transcription:
  enabled: true
  retry_count: 1
  cleanup_audio: true
  language: "nl"  # Dutch
```

## Cost Optimization Tips

### 1. Skip Non-Essential Videos

Only transcribe supermarket videos (already filtered):
- Filter removes ~90% of videos
- Only transcribe the 10% that mention supermarkets

### 2. Monitor Per-Video Costs

Check if long videos are worth transcribing:
```bash
python scripts/report_transcription_costs.py
```

### 3. Batch by Influencer

Process influencers separately to control costs:
```bash
python scripts/transcribe_videos.py pepijn.wijn
# Check costs before doing next influencer
```

## Integration with Smart Scraper

The smart scraper automatically uses transcriptions when available:

```python
# Check if transcription exists
if video_has_transcription:
    wines = extract_wines_from_caption_and_transcription(
        caption, transcription
    )
else:
    wines = extract_wines_from_text(caption)
```

**Workflow:**
1. First scrape: Uses captions only
2. Transcribe: Adds transcriptions to database
3. Second scrape: Uses captions + transcriptions

## Example Session

```bash
# 1. Initial scrape (caption only)
python scripts/smart_scraper.py pepijn.wijn
# Result: 1 wine from 10 videos

# 2. Add transcriptions
python scripts/transcribe_videos.py pepijn.wijn
# Processing 1 video with supermarket mention...
# Cost: $0.007

# 3. Re-scrape with transcriptions
python scripts/smart_scraper.py pepijn.wijn
# Result: 3 wines from same video (better extraction!)

# 4. Check costs
python scripts/report_transcription_costs.py
# Total cost: $0.008
# Wines extracted: 3
# Cost per wine: $0.0027
```

## Performance

**Transcription Speed:**
- Download: ~5-10 seconds per video
- Transcribe: ~10-20 seconds per minute of audio
- **Total: ~15-30 seconds per video**

**Batch Processing:**
- 10 videos: ~3-5 minutes
- 100 videos: ~30-50 minutes
- 241 videos: ~60-120 minutes

## Future Enhancements

Potential improvements:
1. Hybrid mode (only transcribe short captions)
2. Caching video downloads
3. Parallel transcription
4. Audio quality pre-check
5. Language detection

