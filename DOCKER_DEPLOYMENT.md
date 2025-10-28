# 🐳 Docker Deployment Guide for Vinly

Complete guide to deploying Vinly using Docker. This replaces all previous deployment methods.

---

## 🎯 Why Docker?

**Your app now has:**
- ✅ **Zero build issues** - All dependencies packaged together
- ✅ **Consistency** - Same environment locally and in production
- ✅ **Portability** - Deploy anywhere (Render, Railway, fly.io, AWS, etc.)
- ✅ **Simplified setup** - `docker-compose up` replaces complex manual steps
- ✅ **Reproducibility** - Exact same build every time

**Included dependencies:**
- FFmpeg (video processing)
- Chromium via Playwright (TikTok scraping)
- yt-dlp (video downloads)
- All Python packages
- nginx (frontend serving)

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Production Deployment (Render)](#production-deployment-render)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)
5. [Alternative Platforms](#alternative-platforms)

---

## 🚀 Local Development

### Prerequisites

- Docker Desktop installed ([download here](https://www.docker.com/products/docker-desktop/))
- OpenAI API key ([get here](https://platform.openai.com/api-keys))

### Quick Start

**1. Clone and navigate to project:**
```bash
cd vinly
```

**2. Create `.env` file:**
```bash
# Copy the example
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**3. Start the entire stack:**

**On Windows:**
```bash
docker-dev.bat
```

**On Mac/Linux:**
```bash
chmod +x docker-dev.sh
./docker-dev.sh
```

**Or manually:**
```bash
docker-compose up --build
```

**4. Access the application:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

**5. (Optional) Start with database UI:**
```bash
# Windows
docker-dev.bat --with-tools

# Mac/Linux
./docker-dev.sh --with-tools
```

This adds **Mongo Express** at http://localhost:8081 (credentials: admin/admin)

### What's Running?

```
┌─────────────────────────────────────────┐
│  Docker Compose Stack                   │
├─────────────────────────────────────────┤
│  Frontend (nginx)        → Port 80      │
│  Backend (FastAPI)       → Port 8000    │
│  MongoDB                 → Port 27017   │
│  Mongo Express (tools)   → Port 8081    │
└─────────────────────────────────────────┘
```

### Development Workflow

**Hot reload is enabled:**
- Backend: Changes to `app/` directory automatically reload
- Frontend: Rebuild with `docker-compose up --build frontend`

**Run scripts inside backend container:**
```bash
# Access backend shell
docker exec -it vinly-backend bash

# Run scraper
python scripts/smart_scraper.py pepijn.wijn

# Check wines
python scripts/check_wines.py

# Transcribe videos
python scripts/transcribe_videos.py
```

**Stop everything:**
```bash
# Press Ctrl+C, then:
docker-compose down

# Remove all data (including database):
docker-compose down -v
```

---

## 🌐 Production Deployment (Render)

### Prerequisites

1. **GitHub account** with your code pushed
2. **Render account** ([sign up here](https://render.com))
3. **MongoDB Atlas account** ([sign up here](https://mongodb.com/atlas))
4. **OpenAI API key**

### Step 1: Setup MongoDB Atlas

**Create free cluster:**
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create account → "Build a Database"
3. Choose **M0 Free tier**
4. Region: **Frankfurt (eu-central-1)** (closest to Netherlands)
5. Cluster name: `vinly-cluster`

**Create database user:**
1. Security → Database Access → "Add New Database User"
2. Username: `vinly-admin`
3. Password: Generate secure password (save it!)
4. Privileges: "Read and write to any database"

**Configure network access:**
1. Security → Network Access → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

**Get connection string:**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://vinly-admin:<password>@vinly-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `...mongodb.net/vinly?retryWrites...`

### Step 2: Deploy to Render

**Option A: Using Blueprint (Recommended)**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render auto-detects `render.yaml` → Click "Apply"
6. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI key
   - `MONGODB_URI`: Your MongoDB Atlas connection string
7. Click "Create Web Service"
8. Wait 5-10 minutes for build ☕

**Option B: Manual Setup**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: vinly-backend
   Region: Frankfurt
   Branch: main
   Runtime: Docker
   Root Directory: backend
   Dockerfile Path: ./Dockerfile
   Plan: Starter ($7/month) or Free
   ```
5. Environment variables:
   ```
   OPENAI_API_KEY=sk-proj-your-key
   MONGODB_URI=mongodb+srv://vinly-admin:password@cluster.mongodb.net/vinly
   CORS_ORIGINS=https://vinly-backend.onrender.com
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   ```
6. Click "Create Web Service"

### Step 3: Verify Deployment

**Check backend health:**
```bash
curl https://vinly-backend.onrender.com/health

# Expected response:
# {"status":"healthy","database":"connected"}
```

**Access API docs:**
```
https://vinly-backend.onrender.com/docs
```

**Check logs:**
- Render Dashboard → Your service → "Logs" tab
- Look for: "Application startup complete"

### Step 4: Seed Database

**Add your first influencer:**
```bash
curl -X POST https://vinly-backend.onrender.com/api/admin/influencers \
  -H "Content-Type: application/json" \
  -d '{
    "tiktok_username": "pepijn.wijn",
    "platform": "tiktok",
    "name": "Pepijn",
    "is_active": true
  }'
```

**Run initial scraping (via Render shell):**
1. Render Dashboard → Your service → "Shell" tab
2. Run:
   ```bash
   python scripts/smart_scraper.py pepijn.wijn
   python scripts/transcribe_videos.py
   python scripts/extract_wines.py
   python scripts/enrich_wine_images.py
   ```

**Or wait for automated daily scraper:**
- Runs automatically at 2 AM UTC
- Check logs the next morning

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for transcription and extraction | `sk-proj-abc123...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vinly` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `https://vinly-backend.onrender.com` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | Environment: development, staging, production |
| `LOG_LEVEL` | `INFO` | Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL |

### Local Development (.env)

Create `.env` in project root:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

MongoDB is auto-configured in docker-compose.yml.

### Production (Render Dashboard)

Set in Render Dashboard → Environment tab:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
MONGODB_URI=mongodb+srv://vinly-admin:password@cluster.mongodb.net/vinly
CORS_ORIGINS=https://vinly-backend.onrender.com
ENVIRONMENT=production
LOG_LEVEL=INFO
```

---

## 🐛 Troubleshooting

### Local Development Issues

**Docker build fails:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

**Port already in use:**
```bash
# Check what's using the port
docker ps

# Stop all containers
docker-compose down

# Or change ports in docker-compose.yml
```

**MongoDB connection fails:**
```bash
# Check MongoDB is running
docker-compose ps

# Check logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

**Backend can't reach MongoDB:**
- Make sure you're using `mongodb://admin:vinly-local-dev@mongodb:27017/vinly?authSource=admin`
- Note: Use `mongodb` (service name), NOT `localhost`

### Production Issues

**Build fails on Render:**
- Check "Logs" tab for specific error
- Verify Dockerfile syntax
- Ensure all files are committed and pushed to GitHub

**Application crashes on startup:**
```bash
# Common issues:
# 1. Missing environment variables
Check Render Dashboard → Environment tab

# 2. Invalid MongoDB URI
Test connection string locally

# 3. Out of memory
Upgrade to larger Render plan
```

**CORS errors:**
- Verify `CORS_ORIGINS` includes your frontend URL
- Include both http:// and https://
- No trailing slashes

**Images not loading:**
- Check persistent disk is mounted (`/app/static`)
- Verify `image_urls` in database have correct paths
- Check backend serves static files at `/static`

**Database connection failed:**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password are correct
- Ensure database name is in connection string

### Performance Issues

**Slow build times:**
- Docker caches layers - subsequent builds are faster
- First build: ~10-15 minutes
- Rebuilds: ~2-3 minutes

**High memory usage:**
- Chromium (Playwright) uses ~200MB
- FFmpeg processing can spike to 500MB
- Recommended: At least 512MB RAM (Render Starter has 512MB)

---

## 🌍 Alternative Platforms

Your Docker setup works on **any platform** that supports Docker!

### Railway

**Pros:**
- Built-in MongoDB plugin
- Simple pricing ($5/month)
- Great DX

**Deploy:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Fly.io

**Pros:**
- Generous free tier
- Great performance
- Global CDN

**Deploy:**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### DigitalOcean App Platform

**Pros:**
- Simple interface
- Predictable pricing ($5-12/month)
- Includes database

**Deploy:**
1. Connect GitHub repo
2. Auto-detects Dockerfile
3. Add MongoDB database
4. Deploy!

### AWS/Google Cloud/Azure

**For advanced users:**
- ECS/Fargate (AWS)
- Cloud Run (Google)
- Container Instances (Azure)

All support Docker directly.

---

## 💰 Cost Comparison

| Platform | Backend | Database | Total/month |
|----------|---------|----------|-------------|
| **Render Starter** | $7 | Free (Atlas M0) | **$7** |
| **Render Free** | Free (sleeps) | Free (Atlas M0) | **$0** (+ $5-10 OpenAI) |
| **Railway** | $5 | Included | **$5** |
| **Fly.io** | Free tier | $0-5 | **$0-5** |
| **DigitalOcean** | $5 | $7 | **$12** |

**Plus OpenAI costs:** ~$5-10/month for 100 videos

**Recommended for production:** Render Starter ($7) + MongoDB Atlas Free = $7/month

---

## 📊 Monitoring Your Deployment

### Health Checks

```bash
# Backend health
curl https://vinly-backend.onrender.com/health

# API docs
open https://vinly-backend.onrender.com/docs

# Check wines
curl https://vinly-backend.onrender.com/api/wines
```

### Logs

**Render:**
- Dashboard → Logs tab
- Real-time streaming
- Search and filter

**Docker local:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Costs

**OpenAI usage:**
```bash
# In backend container
python scripts/report_transcription_costs.py
```

**MongoDB storage:**
- Atlas Dashboard → Metrics
- Should stay under 512MB (free tier)

---

## 🎉 Success Checklist

- [ ] Local development works with `docker-compose up`
- [ ] Backend health check returns "healthy"
- [ ] MongoDB connection works
- [ ] Can access API docs at /docs
- [ ] Frontend loads at http://localhost
- [ ] Render deployment successful
- [ ] Production health check works
- [ ] Environment variables set correctly
- [ ] Database seeded with influencers
- [ ] Initial scraping completed
- [ ] Wines visible in API
- [ ] Automated scheduler running

---

## 🚀 Next Steps

**After successful deployment:**

1. **Add more influencers:**
   ```bash
   python scripts/seed_tiktok_influencers.py
   ```

2. **Run regular scraping:**
   - Automated: Runs daily at 2 AM UTC
   - Manual: `python scripts/smart_scraper.py [username]`

3. **Monitor costs:**
   - OpenAI: platform.openai.com/usage
   - Render: Dashboard → Billing
   - MongoDB: Atlas → Metrics

4. **Set up monitoring (optional):**
   - [UptimeRobot](https://uptimerobot.com) - Health checks
   - [Sentry](https://sentry.io) - Error tracking
   - [Plausible](https://plausible.io) - Analytics

5. **Custom domain (optional):**
   - Render: Dashboard → Settings → Custom Domains
   - Add CNAME record in your DNS

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Render Docker Deploy](https://render.com/docs/deploy-docker)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)

---

## 🆘 Getting Help

**Build issues?**
1. Check logs: `docker-compose logs`
2. Rebuild from scratch: `docker-compose build --no-cache`
3. Check Dockerfile syntax

**Deployment issues?**
1. Verify environment variables
2. Check Render logs
3. Test MongoDB connection string locally

**Need support?**
- Open an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above

---

**Made with 🍷 and 🐳 for Dutch wine lovers**

Your wine discovery platform is now Dockerized and production-ready! 🎉

