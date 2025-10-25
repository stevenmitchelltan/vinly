# 🍷 Vinly - Quick Reference Guide

## 🎯 What You Have

A **fully automated wine discovery app** that scrapes Instagram daily and serves recommendations via a beautiful web interface.

## 📁 Project Structure

```
vinly/
├── 🔧 Backend (Python FastAPI)
│   ├── Instagram scraping
│   ├── Video transcription (Whisper)
│   ├── AI extraction (GPT-4o-mini)
│   ├── 6 supermarket scrapers
│   └── REST API
│
├── 🎨 Frontend (React + Vite)
│   ├── Modern UI with TailwindCSS
│   ├── Supermarket filters
│   ├── Wine type filters
│   └── Wine display cards
│
├── 📚 Documentation
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── PROJECT_OVERVIEW.md
│
└── 🚀 Automation
    └── GitHub Actions (daily scraping)
```

## ⚡ Quick Commands

### First Time Setup
```bash
# Mac/Linux
chmod +x quickstart.sh && ./quickstart.sh

# Windows
quickstart.bat
```

### Development

**Start Backend**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```
→ Runs at `http://localhost:8000`
→ API docs at `http://localhost:8000/docs`

**Start Frontend**:
```bash
cd frontend
npm run dev
```
→ Runs at `http://localhost:5173`

### Database Operations

**Seed Influencers**:
```bash
cd backend
python scripts/seed_influencers.py
```

**Test Scraping**:
```bash
cd backend
python scripts/test_scraper.py
```

**Manual Scrape**:
```bash
curl -X POST http://localhost:8000/api/admin/trigger-scrape
```

### Deployment

**Backend (Railway)**:
1. Connect GitHub repo
2. Set environment variables
3. Auto-deploys on push

**Frontend (GitHub Pages)**:
```bash
cd frontend
npm run deploy
```

## 🔑 Required Environment Variables

### Backend (`.env`)
```bash
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
CORS_ORIGINS=http://localhost:5173,https://yourusername.github.io
```

### Frontend (`.env.local`)
```bash
VITE_API_BASE_URL=http://localhost:8000  # Development
# VITE_API_BASE_URL=https://your-app.railway.app  # Production
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/wines` | Get all wines |
| GET | `/api/wines?supermarket=Albert%20Heijn` | Filter by supermarket |
| GET | `/api/wines?type=red` | Filter by wine type |
| GET | `/api/supermarkets` | List supermarkets |
| POST | `/api/admin/trigger-scrape` | Manual scrape |

## 🏪 Supported Supermarkets

1. Albert Heijn
2. Dirk
3. HEMA
4. LIDL
5. Jumbo
6. ALDI

## 🍷 Wine Types

- Red (`red`)
- White (`white`)
- Rosé (`rose`)
- Sparkling (`sparkling`)

## 🎨 Frontend Routes

- `/` - Home page (wine browser)
- `/about` - About page

## 📝 To-Do Before Launch

- [ ] Get MongoDB Atlas account → Free at mongodb.com/cloud/atlas
- [ ] Get OpenAI API key → platform.openai.com
- [ ] Create Instagram account (use throwaway)
- [ ] Research Dutch wine influencers
- [ ] Edit `backend/scripts/seed_influencers.py` with real handles
- [ ] Update `frontend/vite.config.js` with your repo name
- [ ] Run seed script
- [ ] Test locally
- [ ] Deploy to Railway
- [ ] Deploy to GitHub Pages
- [ ] Test production

## 🐛 Troubleshooting

**Backend won't start?**
- Check `.env` exists and has all variables
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`

**Frontend won't start?**
- Run `npm install` in frontend directory
- Check Node.js version: `node --version` (need 18+)

**No wines showing?**
- Seed influencers first
- Trigger manual scrape
- Check backend logs
- Verify API is running

**Database connection fails?**
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test connection string

## 💰 Estimated Costs

| Service | Cost |
|---------|------|
| MongoDB Atlas | Free (512MB) |
| Railway | $5-10/month |
| GitHub Pages | Free |
| OpenAI API | $5-15/month |
| **Total** | **~$10-25/month** |

## 📚 Documentation Links

- **Main README**: `README.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Contributing**: `CONTRIBUTING.md`
- **Full Overview**: `PROJECT_OVERVIEW.md`
- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`

## 🔗 Useful Links

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- OpenAI Platform: https://platform.openai.com
- Railway: https://railway.app
- GitHub Pages: https://pages.github.com
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

## 🎓 Learn More

**Backend Technologies**:
- FastAPI → Modern Python web framework
- Motor → Async MongoDB driver
- Instaloader → Instagram scraping
- Whisper → Speech-to-text AI
- GPT-4o-mini → Text understanding AI

**Frontend Technologies**:
- React → UI library
- Vite → Fast build tool
- TailwindCSS → Utility CSS framework
- Axios → HTTP requests

## ⚠️ Important Notes

1. **Instagram Scraping**: Violates ToS, use throwaway account
2. **Rate Limits**: Built-in delays to be respectful
3. **Costs**: Monitor OpenAI usage
4. **Attribution**: Always credit influencers
5. **Legal**: Add disclaimers, 18+ only

## 🆘 Getting Help

1. Check documentation first
2. Review error messages
3. Check logs (Railway/browser console)
4. Test API endpoints manually
5. Open GitHub issue with details

## ✅ Status

**Implementation**: ✅ Complete
**Documentation**: ✅ Complete
**Testing**: ⏳ Ready for you to test
**Deployment**: ⏳ Ready to deploy

---

**Ready to launch!** 🚀

Follow the steps in `DEPLOYMENT.md` to go live.

🍷 Proost!

