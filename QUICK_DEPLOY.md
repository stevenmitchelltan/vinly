# ⚡ Quick Deploy Guide

Get Vinly live in 15 minutes. No experience needed.

---

## ✅ Prerequisites (5 minutes)

### 1. Create Accounts (all free)
- [ ] [GitHub](https://github.com/signup) - Store your code
- [ ] [Render](https://render.com/register) - Host backend
- [ ] [Vercel](https://vercel.com/signup) - Host frontend
- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - Database
- [ ] [OpenAI](https://platform.openai.com/signup) - AI for wine extraction

### 2. Get API Keys
- [ ] **OpenAI API Key**: 
  1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
  2. Click "Create new secret key"
  3. Copy: `sk-proj-...` (save somewhere safe!)

- [ ] **MongoDB Connection String**:
  1. In MongoDB Atlas, click "Database" → "Connect"
  2. Choose "Connect your application"
  3. Copy: `mongodb+srv://username:password@cluster.mongodb.net/`

---

## 🚀 Deploy Backend (5 minutes)

### Step 1: Push Code to GitHub
```bash
# In your project folder
git add .
git commit -m "Ready to deploy"
git push origin main
```

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   ```
   Name: vinly-backend
   Region: Frankfurt
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && playwright install chromium
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Starter ($7/month - or Free to start, but may sleep)
   ```
5. Click **"Advanced"** → **"Add Environment Variable"**:
   ```
   OPENAI_API_KEY = sk-proj-your-key-here
   MONGODB_URI = mongodb+srv://your-connection-string
   CORS_ORIGINS = https://vinly.vercel.app
   ```
6. Click **"Create Web Service"**
7. Wait 3-5 minutes... ☕
8. Copy your backend URL: `https://vinly-backend.onrender.com`

---

## 🎨 Deploy Frontend (3 minutes)

### Step 1: Update Frontend Config
Create `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://vinly-backend.onrender.com
```

Push to GitHub:
```bash
git add .
git commit -m "Add production config"
git push
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. Click **"Environment Variables"**:
   ```
   VITE_API_BASE_URL = https://vinly-backend.onrender.com
   ```
6. Click **"Deploy"**
7. Wait 1-2 minutes... ☕
8. Your app is live! 🎉

### Step 3: Update Backend CORS
1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Find your backend service → **"Environment"**
3. Update `CORS_ORIGINS` to:
   ```
   https://your-app.vercel.app,https://vinly.vercel.app
   ```
4. Click **"Save Changes"**

---

## ✅ Verify Deployment (2 minutes)

### Test Backend
```bash
curl https://vinly-backend.onrender.com/health
```
Expected response: `{"status":"healthy","database":"connected"}`

### Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the Vinly logo 🍷
3. Filters should be visible

---

## 🗄️ Seed Database (Optional - 5 minutes)

### Add Influencer
```bash
# Using Render's web shell (Dashboard → Shell tab)
python scripts/seed_tiktok_influencers.py
```

Or manually via API:
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

### Scrape First Videos
```bash
# In Render shell
python scripts/smart_scraper.py pepijn.wijn
```

This will:
1. Fetch recent TikTok videos (up to 50)
2. Queue them for transcription
3. Takes ~10 minutes for 50 videos

---

## 🎉 You're Live!

Your wine discovery platform is now running at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://vinly-backend.onrender.com`
- **API Docs**: `https://vinly-backend.onrender.com/docs`

### What Happens Next?

1. **Automated scraping** runs daily at 2 AM UTC
2. **Transcriptions** happen automatically when new videos are found
3. **Wine extraction** runs after transcription completes
4. **Images** need to be generated manually (for now):
   ```bash
   python scripts/enrich_wine_images.py
   ```

---

## 💰 Costs

| Service | Free Tier | Paid Tier | Recommended |
|---------|-----------|-----------|-------------|
| Render | 750 hrs/month | $7/month (always-on) | Paid for production |
| Vercel | 100GB bandwidth | Free is enough | Free |
| MongoDB Atlas | 512MB storage | Free is enough | Free |
| OpenAI API | Pay-per-use | ~$5-10/month | As needed |

**Total:** $7-17/month for production-ready setup

---

## 🛠️ Troubleshooting

### Backend won't start?
- Check Render logs (Dashboard → Logs tab)
- Verify environment variables are set
- Make sure MongoDB connection string is correct

### Frontend shows no wines?
- Check browser console (F12) for errors
- Verify `VITE_API_BASE_URL` is correct
- Test backend API directly: `/api/wines`

### CORS errors?
- Make sure `CORS_ORIGINS` includes your Vercel URL
- Add both with and without trailing slash

---

## 🎯 Next Steps

- [ ] Add custom domain (e.g., `vinly.nl`)
- [ ] Set up monitoring (Sentry, Uptime Robot)
- [ ] Configure automated backups
- [ ] Add more influencers
- [ ] Share with friends! 🍷

---

**Need more help?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Ready to customize?** See [README.md](./README.md) for development setup.

