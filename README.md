# 🍷 Vinly - Dutch Supermarket Wine Discovery App

Automatically discover the best wines from Dutch supermarkets based on TikTok influencer recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## 🎯 What is Vinly?

Vinly scrapes TikTok wine influencers, extracts wine recommendations using AI, and presents them in a beautiful searchable interface. Find the best supermarket wines without watching hundreds of videos!

## ✨ Features

- 🎬 **Automated TikTok Scraping** - Gets all videos from wine influencers
- 🤖 **AI Wine Extraction** - Uses GPT-4o-mini to extract wine data
- 🏪 **7 Dutch Supermarkets** - Albert Heijn, Jumbo, LIDL, ALDI, HEMA, Dirk, Plus
- 🎨 **Beautiful Frontend** - Modern React interface with filters
- 💰 **Cost Optimized** - Smart filtering saves on API costs (~$0.50/month)
- 🚀 **Production Ready** - Built for Railway + GitHub Pages deployment

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop ([download here](https://www.docker.com/products/docker-desktop/))
- OpenAI API key ([get here](https://platform.openai.com/api-keys))

### Installation (3 Steps!)

**1. Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/vinly.git
cd vinly
```

**2. Create `.env` file:**
```bash
# Copy the example
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**3. Start everything with Docker:**

**Windows:**
```bash
docker-dev.bat
```

**Mac/Linux:**
```bash
chmod +x docker-dev.sh
./docker-dev.sh
```

**Or manually:**
```bash
docker-compose up --build
```

**4. Access the app:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

**That's it!** 🎉 Docker handles all dependencies (Python, Node, MongoDB, FFmpeg, Chromium)

### Why Docker?

✅ **Zero dependency issues** - Everything packaged together  
✅ **One command setup** - No manual installs  
✅ **Works everywhere** - Same environment locally and in production  
✅ **Includes everything** - FFmpeg, Chromium, MongoDB, all ready to go

## 📖 Documentation

**Getting Started:**
- **[START_HERE.md](START_HERE.md)** - ⭐ Read this first! Quick 3-step setup
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Detailed 5-minute guide

**Docker & Deployment:**
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete deployment guide (local + production)
- **[DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)** - Docker command cheatsheet

**Configuration:**
- **[backend/config/README.md](backend/config/README.md)** - Customize supermarkets and keywords
- **[SECURITY.md](SECURITY.md)** - Security best practices

## 🍷 Usage

### Add Wines from TikTok

**Run scripts inside Docker container:**
```bash
# Access backend shell
docker exec -it vinly-backend bash

# Run the smart scraper
python scripts/smart_scraper.py pepijn.wijn
```

This will:
- ✅ Find ALL videos from the profile
- ✅ Skip already-processed videos
- ✅ Filter out non-wine content
- ✅ Extract only recommended wines
- ✅ Save to database

**Check Results:**
```bash
# Inside container
python scripts/check_wines.py
```

### Customize Keywords

Edit YAML config files (no code changes needed!):
- `backend/config/supermarkets.yaml` - Add supermarkets or aliases
- `backend/config/wine_keywords.yaml` - Add wine terminology
- `backend/config/scraping_settings.yaml` - Adjust settings

## 🏗️ Architecture

```
TikTok Profile
    ↓ [Playwright - Gets all video URLs]
Video URLs (241 videos)
    ↓ [TikTok oEmbed API - Gets descriptions]
Video Descriptions
    ↓ [Pre-filter - Removes non-supermarket content]
Filtered Descriptions (150 wine videos)
    ↓ [GPT-4o-mini - Extracts wine data]
Wine Data (23 recommended wines)
    ↓ [MongoDB - Stores wines]
Database
    ↓ [FastAPI - Serves data]
React Frontend
```

## 💰 Cost Breakdown

**Monthly Operating Costs:**
- MongoDB Atlas: **$0** (free tier, 512MB)
- OpenAI API: **~$5-10** (Whisper + GPT-4o-mini for 100 videos)
- Render Backend: **$0** (free tier with sleep) or **$7** (always-on)
- Local Development: **$0** (Docker runs locally)

**Total: $5-17/month** depending on tier ✨

## 📁 Project Structure

```
vinly/
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── config/       # YAML configurations
│   └── scripts/      # Utility scripts
│       ├── smart_scraper.py      # Main scraper
│       ├── check_wines.py        # Check database
│       ├── seed_tiktok_influencers.py
│       └── tests/    # Test scripts
├── frontend/         # React frontend
│   └── src/          # React components
├── docs/             # Documentation
└── README.md         # This file
```

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- MongoDB with Motor (async database)
- OpenAI GPT-4o-mini (wine extraction) + Whisper (transcription)
- Playwright (TikTok scraping)
- yt-dlp (video downloads)
- FFmpeg (video processing)
- APScheduler (automated jobs)
- Docker (containerization)

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- nginx (production serving)

**DevOps:**
- Docker & Docker Compose
- Render (deployment platform)
- MongoDB Atlas (database hosting)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) first.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

**Important:** This project uses sensitive credentials (MongoDB, OpenAI API keys).

### Quick Security Checklist

- ✅ `.env` files are gitignored
- ✅ Use `.env.example` templates (never commit real `.env`)
- ✅ Rotate credentials regularly
- ✅ Set OpenAI spending limits ($10-20/month recommended)
- ✅ Use MongoDB Network Access whitelist in production

### ⚠️ Credentials Exposed During Development?

If you shared credentials during setup (in chat, screenshots, etc.), **rotate them immediately**:

1. **MongoDB:** Atlas → Database Access → Edit → Change Password
2. **OpenAI:** platform.openai.com/api-keys → Revoke & Create New

**See [SECURITY.md](SECURITY.md) for complete security guide and best practices.**

## ⚠️ Disclaimer

This app is not officially affiliated with any supermarket or TikTok. Wine recommendations are based on influencer opinions. Always drink responsibly.

## 🙏 Acknowledgments

- Dutch wine TikTok community
- OpenAI for GPT-4o-mini
- TikTok oEmbed API

---

**Made with 🍷 for Dutch wine lovers**
