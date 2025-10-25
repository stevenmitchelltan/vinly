# TikTok Video Download Research

## Goal
Find the best method to download TikTok video audio for transcription.

## Methods Investigated

### Method 1: TikTok oEmbed API
**Endpoint:** `https://www.tiktok.com/oembed?url={video_url}`

**Data Provided:**
- `title` (caption)
- `author_name`
- `thumbnail_url`
- `html` (embed code)

**Direct Video URL:** ❌ NO
- oEmbed does NOT provide direct video download links
- Only provides embed HTML and metadata

### Method 2: Direct API Endpoints
**Research:** TikTok's unofficial APIs are heavily protected
- Require authentication tokens
- Frequently change endpoints
- High risk of breaking

**Verdict:** ❌ NOT RELIABLE

### Method 3: yt-dlp (Recommended)
**Tool:** https://github.com/yt-dlp/yt-dlp

**Advantages:**
- ✅ Actively maintained (updated weekly)
- ✅ Supports TikTok natively
- ✅ Can extract audio-only (saves bandwidth)
- ✅ Handles authentication/cookies automatically
- ✅ Widely used and battle-tested

**Installation:**
```bash
pip install yt-dlp
```

**Usage:**
```python
import yt_dlp

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': 'temp/videos/%(id)s.%(ext)s',
    'quiet': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(video_url, download=True)
    audio_file = ydl.prepare_filename(info)
```

## Decision

**Use yt-dlp as primary method**

Reasons:
1. No reliable direct URL method exists
2. yt-dlp is industry standard
3. Actively maintained
4. Works consistently

## Implementation Notes

- Download audio-only format (saves bandwidth ~80%)
- Store in temp directory (auto-cleanup after transcription)
- Use video ID as filename for easy tracking
- Handle rate limiting (TikTok may throttle)
- Cleanup temp files after successful transcription

