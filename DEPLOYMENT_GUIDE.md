# 🚀 Vinly Deployment Guide

Complete guide to deploying your wine discovery platform to production.

---

## 📋 Table of Contents

1. [Quick Deploy (Recommended)](#quick-deploy-recommended)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Detailed Setup](#detailed-setup)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ⚡ Quick Deploy (Recommended)

**Best Stack:** Render (Backend + DB) + Vercel (Frontend)

**Total Time:** ~15 minutes  
**Monthly Cost:** $0 (Free tier) or ~$7 (Production tier)

### Why This Stack?
- ✅ **Free tier available** for testing
- ✅ **Zero config** - deploys from GitHub
- ✅ **Auto HTTPS** - SSL certificates included
- ✅ **Auto scaling** - handles traffic spikes
- ✅ **MongoDB included** - Render has built-in MongoDB
- ✅ **Background jobs** - Scheduler works out of the box

---

## 🔧 Prerequisites

### 1. **Push to GitHub**
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Vinly wine discovery app"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/vinly.git
git branch -M main
git push -u origin main
```

### 2. **Required API Keys**
- **OpenAI API Key** - For wine extraction & transcription ([get here](https://platform.openai.com/api-keys))
- **MongoDB Atlas** (optional if using Render's MongoDB)

### 3. **FFmpeg Setup** (for video frame extraction)
- Local: Already installed ✅
- Production: Will be installed via buildpack/blueprint

---

## 🎯 Deployment Options

| Option | Backend | Frontend | Database | Cost | Difficulty |
|--------|---------|----------|----------|------|------------|
| **🌟 Render + Vercel** | Render | Vercel | Render MongoDB | Free/$7/mo | ⭐ Easy |
| Railway + Vercel | Railway | Vercel | Railway PostgreSQL + MongoDB | ~$5/mo | ⭐⭐ Medium |
| Heroku | Heroku | Heroku | MongoDB Atlas | ~$7/mo | ⭐⭐ Medium |
| AWS/DigitalOcean | EC2/Droplet | S3/CDN | MongoDB Atlas | ~$10/mo | ⭐⭐⭐ Hard |
| Self-hosted VPS | Your server | Your server | Your MongoDB | $5/mo | ⭐⭐⭐ Hard |

---

## 🚀 Detailed Setup: Render + Vercel (Recommended)

### Part 1: Deploy Backend to Render

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize access to your repository

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: vinly-backend
   Region: Frankfurt (closest to NL)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && playwright install chromium
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

#### Step 3: Set Environment Variables
Click **"Environment"** and add:

```bash
# Required
OPENAI_API_KEY=sk-proj-...                    # Your OpenAI API key
MONGODB_URL=<will-add-after-step-4>           # MongoDB connection string
CORS_ORIGINS=https://vinly.vercel.app         # Your frontend URL

# Optional (with defaults)
ENVIRONMENT=production
LOG_LEVEL=INFO
MAX_WORKERS=4
```

#### Step 4: Add MongoDB Database
1. In Render dashboard, click **"New +"** → **"PostgreSQL"** (but we need MongoDB)
   
   **Option A: Use MongoDB Atlas (Recommended)**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free cluster (M0 tier)
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/vinly`
   - Add to `MONGODB_URL` in Render

   **Option B: Use External MongoDB Provider**
   - Try [Railway](https://railway.app) - has MongoDB plugin
   - Or [mLab/DigitalOcean](https://www.digitalocean.com/products/managed-databases-mongodb)

#### Step 5: Add FFmpeg Buildpack
1. In Render service settings, click **"Environment"**
2. Add buildpack:
   ```
   https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   ```

#### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Your backend will be live at: `https://vinly-backend.onrender.com`

---

### Part 2: Deploy Frontend to Vercel

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

#### Step 2: Import Project
1. Click **"Add New Project"**
2. Import your GitHub repository
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

#### Step 3: Set Environment Variables
Click **"Environment Variables"** and add:

```bash
VITE_API_BASE_URL=https://vinly-backend.onrender.com
```

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your frontend will be live at: `https://vinly.vercel.app` (or custom domain)

#### Step 5: Update Backend CORS
1. Go back to Render backend settings
2. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   CORS_ORIGINS=https://vinly.vercel.app,https://vinly-*.vercel.app
   ```
3. Redeploy backend

---

### Part 3: Configure Custom Domain (Optional)

#### Frontend (Vercel)
1. In Vercel project settings → **Domains**
2. Add your domain (e.g., `vinly.nl`)
3. Update DNS records (Vercel will guide you)

#### Backend (Render)
1. In Render service settings → **Custom Domains**
2. Add subdomain (e.g., `api.vinly.nl`)
3. Update DNS records

---

## 📦 Alternative: Railway (All-in-One)

### Why Railway?
- Has built-in MongoDB plugin
- Simpler than Render + Vercel combo
- $5/month includes everything

### Setup
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select repository
4. Add **MongoDB** plugin (click "New" → "Database" → "MongoDB")
5. Configure backend service:
   ```
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add environment variables (Railway auto-fills `MONGODB_URL`)
7. Add frontend service:
   ```
   Root Directory: frontend
   Build Command: npm run build
   Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
   ```

---

## 🗄️ Database Setup

### Seed Initial Data

After deployment, run these commands to populate the database:

```bash
# SSH into Render shell (or use Render's web shell)
python scripts/seed_tiktok_influencers.py

# Or manually add via API
curl -X POST https://vinly-backend.onrender.com/api/admin/influencers \
  -H "Content-Type: application/json" \
  -d '{
    "tiktok_username": "pepijn.wijn",
    "platform": "tiktok",
    "name": "Pepijn",
    "is_active": true
  }'
```

### Run Initial Scraping

```bash
# Via Render shell
python scripts/smart_scraper.py pepijn.wijn

# Or wait for automated daily scraper (runs at 02:00 UTC)
```

---

## 🔄 Post-Deployment

### 1. **Verify API Health**
```bash
curl https://vinly-backend.onrender.com/health
# Expected: {"status":"healthy","database":"connected"}
```

### 2. **Generate Wine Images**
```bash
# After transcriptions complete, enrich images
python scripts/enrich_wine_images.py
```

### 3. **Monitor Logs**
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Function Logs

### 4. **Set Up Monitoring** (Optional)
- Add [Sentry](https://sentry.io) for error tracking
- Add [Uptime Robot](https://uptimerobot.com) for health checks

---

## 📊 Monitoring & Maintenance

### Automated Jobs

The backend scheduler runs these automatically:

| Job | Schedule | Action |
|-----|----------|--------|
| **Daily Scraper** | 02:00 UTC | Scrapes new TikTok videos from influencers |
| **Inventory Updater** | Weekly | Updates wine availability (future feature) |

### Manual Maintenance

```bash
# Transcribe pending videos
python scripts/transcribe_videos.py

# Extract wines from transcriptions
python scripts/extract_wines.py

# Enrich wine images
python scripts/enrich_wine_images.py

# Clean old data
python scripts/clean_database.py
```

### Costs Monitoring

**OpenAI API Usage:**
- **Whisper**: ~$0.006 per video (1 min average)
- **GPT-4**: ~$0.02 per video extraction
- **Monthly estimate**: ~$5-10 for 100 videos

Check costs:
```bash
python scripts/report_transcription_costs.py
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Backend won't start**
- Check logs for missing environment variables
- Verify `MONGODB_URL` is correct
- Ensure FFmpeg buildpack is installed

#### 2. **CORS errors**
- Verify `CORS_ORIGINS` includes your frontend URL
- Check for trailing slashes (include both with/without)

#### 3. **Images not loading**
- Verify static files are served at `/static`
- Check `image_urls` in database have correct paths
- Ensure backend URL is set in frontend `.env`

#### 4. **Scheduler not running**
- Check Render instance is not sleeping (upgrade to paid if needed)
- Verify timezone settings in `backend/app/scheduler.py`

### Getting Help

- Check logs in Render/Vercel dashboards
- Review error messages in browser console (F12)
- Check API responses in Network tab

---

## 🎉 Success Checklist

- [ ] Backend API is live and healthy
- [ ] Frontend loads at your domain
- [ ] Wines are visible on homepage
- [ ] Filters work (supermarket, wine type)
- [ ] Image carousel works
- [ ] Mobile swipe gestures work
- [ ] Daily scraper is scheduled
- [ ] Database is backed up
- [ ] Monitoring is set up
- [ ] Custom domain configured (optional)

---

## 🚦 Deployment Comparison

### Free Tier Limitations

| Platform | Free Tier | Limits |
|----------|-----------|--------|
| **Render** | ✅ Yes | 750 hours/month, sleeps after 15min inactive |
| **Vercel** | ✅ Yes | 100GB bandwidth, unlimited projects |
| **Railway** | ❌ No | $5/month credit, then pay-as-you-go |
| **Heroku** | ❌ No | Discontinued free tier Nov 2022 |

### Recommended for Production

**Option 1: Render + Vercel** (~$7/month)
- Render: Web Service ($7/month for always-on)
- Vercel: Free tier (plenty for this app)
- MongoDB Atlas: Free tier (M0 - 512MB)

**Option 2: Railway** (~$10-15/month)
- All-in-one platform
- MongoDB included
- Better for simpler setup

---

## 📝 Environment Variables Reference

### Backend (.env)

```bash
# Required
OPENAI_API_KEY=sk-proj-xxx
MONGODB_URL=mongodb+srv://...
CORS_ORIGINS=https://vinly.vercel.app

# Optional
ENVIRONMENT=production
LOG_LEVEL=INFO
MAX_WORKERS=4
TRANSCRIPTION_MODEL=whisper-1
EXTRACTION_MODEL=gpt-4o-mini
```

### Frontend (.env)

```bash
# Required
VITE_API_BASE_URL=https://vinly-backend.onrender.com
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore` ✅
2. **Use environment variables** for all secrets
3. **Enable HTTPS only** - Both Render & Vercel do this automatically
4. **Rate limit API** - Consider adding rate limiting middleware
5. **Database backups** - MongoDB Atlas auto-backups on paid tier
6. **Update dependencies** - Run `npm audit` and `pip check` monthly

---

## 🎯 Next Steps

After deployment:

1. **Add more influencers** - `python scripts/seed_tiktok_influencers.py`
2. **Set up analytics** - Google Analytics or Plausible
3. **SEO optimization** - Add meta tags, sitemap
4. **Custom domain** - `vinly.nl` sounds perfect! 🍷
5. **Share with users** - Get feedback and iterate

---

**Need help?** Check the logs, review the troubleshooting section, or open an issue on GitHub.

**Ready to launch?** Follow the Quick Deploy guide and you'll be live in 15 minutes! 🚀

