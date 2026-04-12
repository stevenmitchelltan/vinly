# Wine Discovery Backend

FastAPI backend that processes TikTok wine videos and serves the results. Runs in Docker via `docker-compose up`.

The primary way to add wines is through the **admin panel** at `localhost:5173/admin` — paste a TikTok URL and the full pipeline runs automatically. The CLI scripts below can also be used directly.

## Pipeline

1) Discover and queue relevant videos
- Script: `scripts/smart_scraper.py`
- Uses oEmbed metadata and caption filtering to detect supermarket-related videos
- Special handling for ambiguous "Plus": only accept case-sensitive `Plus`/`PLUS` as a word or hashtag
- Queues videos in `processed_videos` with `transcription_status: "pending"`

2) Transcribe audio
- Script: `scripts/transcribe_videos.py`
- Downloads audio with `yt-dlp` and locates `ffmpeg` automatically (Windows WinGet path supported)
- Preprocesses audio to 16kHz mono WAV
- Runs Whisper (`whisper-1`) with a lexicon-driven `initial_prompt`
- Selective two-pass: enriches prompt and re-transcribes when heuristics trigger
- Stores: `transcription`, `asr_metrics`, `audio_duration_seconds`, and `post_date` (when available)

3) Extract supermarket wines
- Script: `scripts/extract_wines.py`
- Model: GPT-4o-mini
- Strict rules (enforced in system & user prompts):
  - Only extract when a valid supermarket is explicitly mentioned (no guessing)
  - One clear winner per video
  - Early-mention bias unless a later wine is clearly endorsed
  - Rating: short, enthusiastic verdict (max ~3–5 words)
  - Description: longer (10–20 words) quote/summary including taste notes

4) Serve to the frontend
- App: `app/main.py` (FastAPI)
- Endpoint: `GET /api/wines` with sorting by `post_date` (fallback `date_found`)

## Running

The backend runs in Docker — see the root README. For local development without Docker:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # fill in MONGODB_URI and OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

## CLI Scripts

Run inside the Docker container (`docker-compose exec backend bash`) or locally with the venv activated.

```bash
# Process a TikTok handle end-to-end
python scripts/smart_scraper.py pepijn.wijn
python scripts/transcribe_videos.py
python scripts/extract_wines.py pepijn.wijn
```

## API

- Docs: `http://localhost:8000/docs`
- Wines: `GET /api/wines?supermarket={name}&type={wine_type}`
- Health: `GET /health`

## Configuration

- `config/lexicon.yaml` — supermarket names, brands, grapes, regions, wine terms used to guide ASR prompts
- `config/scraping_settings.yaml` — `asr_settings.enable_two_pass`, `asr_version` labels, etc.
- `config/supermarkets.yaml`, `config/wine_keywords.yaml` — source lists used by filtering and prompts

## Useful Scripts

- `scripts/inspect_llm_data.py` — inspect what is sent to the LLM for extraction
- `scripts/check_wines.py` — browse wines in the database
- `scripts/report_transcription_costs.py` — track ASR cost/runtime
- `scripts/inspect_filtering.py` — debug supermarket filtering behavior
- `scripts/monitor_scraping.py` — monitor scraping queue
- `scripts/dev/view_transcription.py` — view caption/transcription (emoji-safe printing)
- `scripts/dev/eval_asr.py` — aggregate ASR metrics and compare by version

## Data Model (high-level)

- `processed_videos`
  - `video_url`, `tiktok_handle`, `caption`, `post_date`
  - `transcription_status` (pending/success/error), `transcription`, `asr_metrics`, `audio_duration_seconds`
  - timestamps: `processed_date`, `transcription_date`

- `wines`
  - `name`, `type`, `supermarket`
  - `rating` (short enthusiastic verdict)
  - `description` (10–20 words with taste notes/quote)
  - `date_found` (from `post_date` when available)

## Windows Notes

- `ffmpeg` not found: install via WinGet `winget install Gyan.FFmpeg`.
  - The downloader attempts to auto-detect WinGet paths (e.g., `...\\ffmpeg-...\\bin`).
- `yt-dlp` errors: update with `pip install --upgrade yt-dlp`.
- Unicode in console: some scripts print ASCII-only to avoid Windows console issues.

## Project Structure

```
backend/
├── app/
│   ├── api/                # FastAPI routes (wines, health, status, admin)
│   ├── services/           # ASR, extraction, downloading, audio processing
│   ├── scrapers/           # TikTok oEmbed scraper
│   ├── utils/              # config loader, helpers
│   ├── main.py             # FastAPI app
│   └── ...
├── config/                 # lexicon + settings
├── scripts/                # pipeline + utilities (+ dev tools)
├── static/                 # wine images
├── temp/                   # downloaded videos/frames (gitignored)
├── requirements.txt
└── Dockerfile
```
