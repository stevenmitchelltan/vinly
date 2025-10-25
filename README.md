# 🍷 Vinly - Dutch Supermarket Wine Discovery App

Automatically discover the best wines from Dutch supermarkets based on Instagram influencer recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## 🎯 Overview

Vinly is a full-stack web application that:
- 📱 Scrapes Instagram posts from Dutch wine influencers daily
- 🎥 Transcribes video reviews using OpenAI Whisper
- 🤖 Extracts structured wine data using GPT-4o-mini
- 🏪 Checks inventory across 6 Dutch supermarkets
- 🌐 Serves recommendations via a beautiful React frontend

## ✨ Features

- **Automated Scraping**: Daily Instagram scraping with video transcription
- **6 Dutch Supermarkets**: Albert Heijn, Dirk, HEMA, LIDL, Jumbo, ALDI
- **Smart Filtering**: Filter by supermarket and wine type (red, white, rosé, sparkling)
- **Influencer Credits**: See which influencer recommended each wine
- **Stock Checking**: Automated inventory verification
- **Modern UI**: Beautiful, responsive design with TailwindCSS
- **Free Hosting**: Backend on Railway, Frontend on GitHub Pages

## 🏗️ Architecture

```
┌─────────────────┐
│  Instagram API  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Backend (FastAPI)         │
│  - Instagram Scraper        │
│  - Video Transcription      │
│  - Wine Data Extraction     │
│  - Supermarket Scrapers     │
│  - Daily Scheduler          │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────┐
│  MongoDB Atlas  │
│  (Free Tier)    │
└─────────────────┘
          │
          ▼
┌─────────────────────────────┐
│   Frontend (React + Vite)   │
│  - Supermarket Filters      │
│  - Wine Type Filters        │
│  - Wine Display Grid        │
└─────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (free)
- OpenAI API key
- Instagram account (throwaway recommended)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# - MONGODB_URI
# - OPENAI_API_KEY
# - INSTAGRAM_USERNAME
# - INSTAGRAM_PASSWORD

# Seed influencer accounts (edit script first!)
python scripts/seed_influencers.py

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

API documentation at `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with backend URL
# VITE_API_BASE_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📦 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB Atlas**: Cloud database (free tier)
- **Motor**: Async MongoDB driver
- **Instaloader**: Instagram scraping
- **OpenAI Whisper**: Video transcription
- **GPT-4o-mini**: Wine data extraction
- **BeautifulSoup**: Web scraping
- **APScheduler**: Job scheduling

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Router**: Routing
- **Axios**: HTTP client

## 🚢 Deployment

### Backend (Railway)

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy (automatic from `Procfile`)

### Frontend (GitHub Pages)

```bash
cd frontend

# Update vite.config.js with your repo name
# base: '/your-repo-name/'

# Build and deploy
npm run build
npm run deploy

# Configure GitHub Pages
# Settings → Pages → Source: gh-pages branch
```

### GitHub Actions

Add backend URL as GitHub secret:
- Go to repository Settings → Secrets
- Add `BACKEND_URL` with your Railway URL

The workflow in `.github/workflows/scrape.yml` will trigger daily scraping.

## 📊 Database Schema

### Wines Collection
```javascript
{
  _id: ObjectId,
  name: String,
  supermarket: String,
  wine_type: String, // red, white, rose, sparkling
  image_url: String,
  rating: String,
  influencer_source: String,
  post_url: String,
  date_found: Date,
  in_stock: Boolean,
  last_checked: Date,
  description: String
}
```

### Influencers Collection
```javascript
{
  _id: ObjectId,
  instagram_handle: String,
  is_active: Boolean,
  last_scraped: Date
}
```

## 📝 API Endpoints

- `GET /api/wines?supermarket={name}&type={wine_type}` - Get filtered wines
- `GET /api/supermarkets` - Get supermarket list
- `POST /api/admin/trigger-scrape` - Manually trigger scraping
- `GET /health` - Health check

## ⚙️ Configuration

### Adding Influencers

Edit `backend/scripts/seed_influencers.py`:

```python
influencers = [
    {"instagram_handle": "wijnconsulent", "is_active": True},
    {"instagram_handle": "wijnreview", "is_active": True},
    # Add more...
]
```

Run: `python backend/scripts/seed_influencers.py`

### Scheduling

Daily scraping runs at 6:00 AM by default. Change in `backend/app/scheduler.py`:

```python
scheduler.add_job(
    run_scraping_job_sync,
    CronTrigger(hour=6, minute=0),  # Change time here
    ...
)
```

## ⚠️ Important Notes

### Legal & Ethical

- **Instagram Scraping**: Violates Instagram ToS. Account may be banned. Use throwaway account.
- **Supermarket Scraping**: May violate website ToS. Be respectful with request rates.
- **Influencer Content**: Consider reaching out to influencers for permission.
- **Attribution**: Always credit influencers for their recommendations.

### Costs

- **MongoDB Atlas**: Free up to 512MB
- **Railway**: Free 500 hours/month
- **GitHub Pages**: Free for public repos
- **OpenAI Whisper**: ~$0.006/minute of video
- **OpenAI GPT-4o-mini**: ~$0.15 per 1M input tokens

**Estimated monthly cost**: $5-20 depending on video volume

### Rate Limiting

- Instagram: Built-in delays in scraper
- Supermarkets: Random delays (1-3 seconds)
- OpenAI: Generous rate limits on free tier

## 🧪 Testing

### Manual Scraping Test

```bash
# Trigger scrape via API
curl -X POST http://localhost:8000/api/admin/trigger-scrape

# Check logs for results
```

### Health Check

```bash
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

### Instagram Login Fails
- Use throwaway account
- Enable 2FA and create app password
- Try different network/VPN

### No Wines Found
- Check if influencers are seeded
- Manually trigger scrape
- Check backend logs for errors

### Transcription Errors
- Verify OpenAI API key
- Check API quota
- Ensure video files are accessible

### Database Connection Issues
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Dutch wine influencers for their content
- OpenAI for Whisper and GPT APIs
- Instaloader developers
- FastAPI and React communities

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This app is not affiliated with any supermarkets or influencers. Wine recommendations are opinions. Drink responsibly. 18+ only.

