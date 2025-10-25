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

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (free tier)
- OpenAI API key

### Installation

**Windows:**
```bash
quickstart.bat
```

**Mac/Linux:**
```bash
chmod +x quickstart.sh
./quickstart.sh
```

### Manual Setup

**1. Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

**2. Configure Environment:**

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGINS=http://localhost:5173
```

**3. Start Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**4. Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**5. Visit:** http://localhost:5173/vinly/

## 📖 Documentation

- **[Quick Start Guide](docs/QUICK_START_GUIDE.md)** - Get up and running quickly
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to production
- **[Configuration Guide](docs/CONFIGURATION_GUIDE.md)** - Customize keywords and settings
- **[System Overview](docs/SYSTEM_COMPLETE.md)** - Complete feature documentation
- **[Process Flow](docs/PROCESS_FLOW.md)** - How everything works
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute

## 🍷 Usage

### Add Wines from TikTok

**Automatic (Recommended):**
```bash
cd backend
venv\Scripts\activate
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
- OpenAI API: **~$0.50** (GPT-4o-mini)
- Railway Backend: **$0** (500 hrs free tier)
- GitHub Pages: **$0** (static hosting)

**Total: ~$0.50/month** ✨

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
- OpenAI GPT-4o-mini (wine extraction)
- Playwright (TikTok scraping)
- APScheduler (automated jobs)

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) first.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This app is not officially affiliated with any supermarket or TikTok. Wine recommendations are based on influencer opinions. Always drink responsibly.

## 🙏 Acknowledgments

- Dutch wine TikTok community
- OpenAI for GPT-4o-mini
- TikTok oEmbed API

---

**Made with 🍷 for Dutch wine lovers**
