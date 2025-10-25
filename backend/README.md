# Wine Discovery Backend

Backend API for the Wine Discovery app - gets wine recommendations from Dutch TikTok wine influencers.

## Features

- 🔄 TikTok video scraping using oEmbed API
- 🤖 AI-powered wine data extraction with GPT-4o-mini
- 📊 RESTful API with automatic documentation
- 🗄️ MongoDB database for wine storage

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: MongoDB Atlas connection string
- `OPENAI_API_KEY`: OpenAI API key for GPT-4o-mini wine extraction
- `CORS_ORIGINS`: Comma-separated list of allowed origins

### 3. Setup MongoDB Atlas

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### 4. Seed TikTok Influencers

Edit `scripts/seed_tiktok_influencers.py` to add Dutch wine TikTok creators and their video URLs:

```bash
python scripts/seed_tiktok_influencers.py
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

- `GET /api/wines?supermarket={name}&type={wine_type}` - Get wines filtered by supermarket and/or type
- `GET /api/supermarkets` - Get list of available supermarkets
- `POST /api/admin/trigger-scrape` - Manually trigger scraping job
- `GET /api/status` - Get scraping status and database stats
- `GET /health` - Health check

## How It Works

### TikTok Scraping (oEmbed Method)

Instead of complex browser automation, we use TikTok's official oEmbed API:

1. You browse TikTok and find wine videos
2. Copy the video URLs  
3. Add them to `seed_tiktok_influencers.py`
4. Run the scraping job
5. oEmbed API gets video descriptions
6. GPT-4o-mini extracts wine information
7. Wines saved to database!

**Benefits:**
- ✅ No login required
- ✅ No bot detection
- ✅ Simple and reliable
- ✅ Same method used by TikTok video downloaders
- ✅ No Terms of Service violations

## Adding Wines

### Option 1: Use the Script

```bash
# 1. Find wine videos on TikTok
# 2. Edit scripts/seed_tiktok_influencers.py
# 3. Add video URLs to the list
# 4. Run:
python scripts/seed_tiktok_influencers.py
python scripts/add_tiktok_wines.py
```

### Option 2: Manual Scrape Trigger

```bash
# Trigger via API
curl -X POST http://localhost:8000/api/admin/trigger-scrape
```

Or use the API docs at `/docs`

## Deployment to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy!

Railway will automatically detect the `Procfile` and deploy the app.

## Important Notes

⚠️ **TikTok Content**: Using TikTok's oEmbed API for public content is within their terms

⚠️ **Costs**: 
- MongoDB Atlas: Free up to 512MB
- OpenAI GPT-4o-mini: Very cheap (~$0.15 per 1M tokens)
- Railway: Free 500 hours/month

## Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Test TikTok wine extraction
python scripts/test_tiktok_oembed_wines.py

# Check wines in database
python scripts/check_wines.py
```

## Project Structure

```
backend/
├── app/
│   ├── api/              # API route handlers
│   ├── jobs/             # Background scraping jobs
│   ├── scrapers/         # TikTok oEmbed scraper
│   ├── services/         # Wine extraction, inventory
│   ├── config.py         # Configuration
│   ├── database.py       # MongoDB connection
│   ├── models.py         # Pydantic models
│   ├── scheduler.py      # Job scheduler
│   └── main.py           # FastAPI app
├── scripts/              # Utility scripts
├── requirements.txt
└── Procfile              # Railway deployment config
```

## Tech Stack

- **FastAPI**: Modern Python web framework
- **MongoDB Atlas**: Cloud database
- **OpenAI GPT-4o-mini**: Wine data extraction
- **TikTok oEmbed API**: Video metadata retrieval
- **APScheduler**: Job scheduling

## License

MIT
