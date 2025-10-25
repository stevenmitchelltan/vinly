# Development & Debugging Utilities

This folder contains development-only scripts for debugging and testing transcription features.

## Scripts

### Transcription Debugging

- **`eval_asr.py`** - Evaluate ASR metrics by version and date range
  ```bash
  python backend/scripts/dev/eval_asr.py [handle] [days]
  ```

- **`force_retranscribe.py`** - Force re-transcription of videos with new settings
  ```bash
  python backend/scripts/dev/force_retranscribe.py [handle] [limit]
  ```

- **`inspect_transcript_diffs.py`** - Compare before/after transcriptions
  ```bash
  python backend/scripts/dev/inspect_transcript_diffs.py [handle] [limit]
  ```

### Transcription Monitoring

- **`check_failed_transcriptions.py`** - List videos with failed transcriptions
- **`retry_failed_transcriptions.py`** - Retry previously failed transcriptions
- **`view_transcription.py`** - View transcription for a specific video

## Usage

These are development utilities and not needed for normal operation. They're useful for:
- Debugging transcription issues
- Testing new ASR configurations
- Analyzing transcription quality improvements
- Re-processing videos after config changes

## Production Scripts

For normal operation, use the main scripts in `backend/scripts/`:
- `transcribe_videos.py` - Transcribe new videos
- `report_transcription_costs.py` - View costs and stats
- `smart_scraper.py` - Main scraping workflow

