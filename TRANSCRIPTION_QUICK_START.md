# Video Transcription - Quick Start

## Installation (One-Time Setup)

```bash
# 1. Install Python dependencies
cd backend
pip install -r requirements.txt

# 2. Install ffmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg  
# Linux: sudo apt-get install ffmpeg

# 3. Verify installation
ffmpeg -version
yt-dlp --version
```

## Daily Usage

### Complete Workflow

```bash
cd backend

# Step 1: Scrape new videos
python scripts/smart_scraper.py pepijn.wijn

# Step 2: Transcribe supermarket videos  
python scripts/transcribe_videos.py pepijn.wijn

# Step 3: Re-extract wines with transcriptions
python scripts/smart_scraper.py pepijn.wijn

# Step 4: Check costs
python scripts/report_transcription_costs.py
```

## Commands

| Command | Purpose |
|---------|---------|
| `python scripts/transcribe_videos.py` | Transcribe ALL pending videos |
| `python scripts/transcribe_videos.py pepijn.wijn` | Transcribe one influencer |
| `python scripts/report_transcription_costs.py` | View costs and stats |
| `python scripts/check_wines.py` | Check wines in database |

## Costs

- **Per video:** ~$0.007 (Whisper + GPT)
- **241 videos:** ~$1.69
- **Monthly (10 influencers):** ~$67

## Expected Results

- **Without transcription:** 10% success rate (~24 wines)
- **With transcription:** 30-50% success rate (~72-120 wines)
- **Improvement:** 3-5x more wines!

## Status Check

```bash
# How many wines?
python scripts/check_wines.py

# Transcription costs?
python scripts/report_transcription_costs.py

# Test one video?
python scripts/transcribe_videos.py pepijn.wijn
```

## Files Created

- `backend/app/services/video_downloader.py` - Downloads TikTok videos
- `backend/app/services/transcription.py` - Whisper API integration
- `backend/scripts/transcribe_videos.py` - Batch processor
- `backend/scripts/report_transcription_costs.py` - Cost monitoring
- Full docs in `backend/docs/TRANSCRIPTION_GUIDE.md`

## Ready to Use! ✓

