# 🆓 Free Deployment Guide - $0 Hosting!

Deploy Vinly completely **FREE** using GitHub Pages (frontend) and Render Free Tier (backend).

**Total Monthly Cost: $5-10** (only OpenAI API usage, no hosting fees!)

---

## 📊 What You Get

| Component | Service | Cost | Details |
|-----------|---------|------|---------|
| Frontend | GitHub Pages | FREE | 100GB bandwidth, global CDN |
| Backend | Render Free Tier | FREE | 750 hours/month, sleeps after 15 min |
| Database | MongoDB Atlas | FREE | 512MB storage (M0 tier) |
| OpenAI API | Pay-as-you-go | ~$5-10/mo | Whisper + GPT-4 usage |

**Total: $5-10/month** vs $12-17 with paid hosting!

---

## ⚠️ Free Tier Limitations

### Render Free Tier

**Limitations:**
- Sleeps after 15 minutes of inactivity
- 50 second cold start on first request after sleep
- 750 hours/month (31 days = 744 hours, so just enough!)
- Shared resources (slower performance)
- No custom domains

**Perfect for:**
- Personal projects
- Portfolio pieces
- Low-traffic apps (<100 visits/day)
- Testing and demos

**Not good for:**
- Production apps with real users
- Time-sensitive operations
- High-traffic applications

---

## 🚀 Step-by-Step Deployment

### Part 1: Setup MongoDB Atlas (5 minutes)

#### 1. Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google/email
3. Choose "Free Shared" cluster

#### 2. Create Cluster
1. Choose cloud provider: **AWS**
2. Region: **Frankfurt (eu-central-1)** - closest to Netherlands
3. Cluster tier: **M0 Sandbox (FREE)**
4. Cluster name: `vinly-cluster`
5. Click **Create**

#### 3. Setup Database Access
1. Security → Database Access → **Add New Database User**
2. Username: `vinly-admin`
3. Password: Generate secure password (save it!)
4. Database User Privileges: **Read and write to any database**
5. Click **Add User**

#### 4. Setup Network Access
1. Security → Network Access → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Click **Confirm**

#### 5. Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Python**, Version: **3.11 or later**
4. Copy connection string:
   ```
   mongodb+srv://vinly-admin:<password>@vinly-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Save this - you'll need it for Render!

---

### Part 2: Deploy Backend to Render (10 minutes)

#### 1. Push Code to GitHub
```bash
# Make sure your code is committed
git add .
git commit -m "Ready for free deployment"
git push origin main
```

#### 2. Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### 3. Deploy with Blueprint
1. Click **New +** → **Blueprint**
2. Connect your repository
3. Render will detect `render.yaml` automatically
4. Click **Apply**

#### 4. Set Environment Variables
After blueprint creates the service:

1. Go to your service → **Environment**
2. Add these variables:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
MONGODB_URI=mongodb+srv://vinly-admin:YOUR_PASSWORD@vinly-cluster.xxxxx.mongodb.net/vinly?retryWrites=true&w=majority
CORS_ORIGINS=https://YOUR_GITHUB_USERNAME.github.io
```

**Important:**
- Get OpenAI key from: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Use the MongoDB connection string from Part 1
- Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username

3. Click **Save Changes**

#### 5. Wait for Deployment
- First deploy takes ~5 minutes
- Watch the logs in the **Logs** tab
- Look for: `Application startup complete`
- Your backend URL: `https://vinly-backend.onrender.com`

#### 6. Verify Backend
```bash
# Test health endpoint
curl https://vinly-backend.onrender.com/health

# Expected response:
{"status":"healthy","database":"connected"}
```

---

### Part 3: Deploy Frontend to GitHub Pages (5 minutes)

#### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Click **Save**

#### 2. Add Backend URL Secret
1. Settings → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   ```
   Name: VITE_API_BASE_URL
   Value: https://vinly-backend.onrender.com
   ```
4. Click **Add secret**

#### 3. Update Render CORS
1. Go back to Render dashboard
2. Your service → **Environment**
3. Update `CORS_ORIGINS`:
   ```
   https://YOUR_USERNAME.github.io
   ```
4. Save and redeploy

#### 4. Deploy Frontend
```bash
# Just push to GitHub
git push origin main
```

GitHub Actions will automatically:
- Build your React app
- Deploy to GitHub Pages
- Live in ~2 minutes!

#### 5. Access Your App
Your app is now live at:
```
https://YOUR_USERNAME.github.io/vinly/
```

---

## ✅ Verify Everything Works

### 1. Check Frontend
Visit: `https://YOUR_USERNAME.github.io/vinly/`

You should see:
- ✅ Vinly logo and branding
- ✅ Supermarket filter buttons
- ✅ Wine type filters
- ✅ No CORS errors in console (F12)

### 2. Check Backend
```bash
# Health check
curl https://vinly-backend.onrender.com/health

# API docs
open https://vinly-backend.onrender.com/docs
```

### 3. Check Database Connection
```bash
# Check if wines endpoint works (even if empty)
curl https://vinly-backend.onrender.com/api/wines
```

---

## 🗄️ Seed Your Database

### Add Influencer
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

### Run Initial Scraping

**Option A: Via Render Shell**
1. Render dashboard → your service → **Shell** tab
2. Run:
   ```bash
   python scripts/smart_scraper.py pepijn.wijn
   python scripts/transcribe_videos.py
   python scripts/extract_wines.py
   python scripts/enrich_wine_images.py
   ```

**Option B: Wait for Automated Daily Scraper**
- Runs automatically at 2 AM UTC
- Check logs next morning

---

## 💤 Understanding Sleep Behavior

### How It Works

**Render Free Tier:**
- Backend sleeps after 15 minutes of no requests
- First request after sleep takes ~50 seconds (cold start)
- Subsequent requests are fast

**User Experience:**
```
First visit after sleep:
  User opens app → 50s wait → App loads

Next visits (within 15 min):
  User opens app → Instant load
```

### Keeping Backend Awake (Optional)

#### Option A: UptimeRobot (Free)
1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://vinly-backend.onrender.com/health`
   - Interval: 5 minutes
3. Your backend stays awake during the day!

**Caveat:** Uses ~288 hours/month (5 min intervals), stays within 750 hour limit

#### Option B: Accept Cold Starts
- Good for personal use
- Users see "Loading..." for 50s on first visit
- No additional setup needed

#### Option C: Upgrade to Starter
- $7/month for always-on
- No cold starts
- Worth it if you have regular users

---

## 🔄 Automated Deployments

### How It Works

```
You push code to GitHub
    ↓
GitHub detects changes
    ↓
    ├─ Frontend changed? → GitHub Actions → GitHub Pages
    ↓
    └─ Backend changed? → Render auto-deploy → Live in 3 min
```

**Both deploy automatically on `git push`!**

---

## 🐛 Troubleshooting

### Backend won't start

**Check Render logs:**
1. Dashboard → Your service → **Logs**
2. Look for errors

**Common issues:**
- Missing environment variables
- Invalid MongoDB connection string
- OpenAI API key not set

**Fix:**
- Verify all env vars in Render dashboard
- Test MongoDB connection string locally
- Check OpenAI API key is valid

### Frontend shows no wines

**Check browser console (F12):**
- CORS errors? Update `CORS_ORIGINS` in Render
- API errors? Check backend logs
- Network errors? Verify `VITE_API_BASE_URL` secret

**Test backend directly:**
```bash
curl https://vinly-backend.onrender.com/api/wines
```

### Database connection failed

**Verify MongoDB:**
- IP whitelist includes 0.0.0.0/0
- Username/password are correct
- Database name is in connection string

**Test connection:**
```bash
# In Render shell
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; asyncio.run(AsyncIOMotorClient('YOUR_MONGODB_URI').admin.command('ping')); print('Connected!')"
```

### Cold starts too slow

**Options:**
1. Use UptimeRobot to keep awake
2. Upgrade to Starter plan ($7/month)
3. Accept 50s wait for first visit

### Hit 750 hour limit

**You're using the backend too much!**

**Solutions:**
- Reduce UptimeRobot ping frequency
- Only keep awake during certain hours
- Upgrade to Starter plan

---

## 📊 Monitor Your Usage

### Render Dashboard
- Service → **Metrics**
- Check hours used this month
- Should stay under 750 hours

### MongoDB Atlas
- Database → **Metrics**
- Check storage used
- Should stay under 512MB

### OpenAI API
- [platform.openai.com/usage](https://platform.openai.com/usage)
- Track transcription and extraction costs
- Budget: ~$5-10/month for 100 videos

---

## 💰 Cost Breakdown

### What's Actually Free

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| GitHub Pages | 100GB bandwidth/month | Frontend hosting |
| Render | 750 hours/month | Backend hosting (with sleep) |
| MongoDB Atlas | 512MB storage | Database (plenty for 1000+ wines) |

### What You Pay For

| Service | Cost | Usage |
|---------|------|-------|
| OpenAI Whisper | $0.006/min | ~$0.30 for 50 videos |
| OpenAI GPT-4 | Variable | ~$0.02 per wine extraction |
| **Monthly total** | **$5-10** | Based on ~100 videos/month |

---

## 🚀 Next Steps

### After Deployment

1. **Test everything**
   - [ ] Frontend loads
   - [ ] Backend responds
   - [ ] Database connected
   - [ ] Wines display
   - [ ] Images load
   - [ ] Filters work
   - [ ] Mobile works

2. **Add content**
   - [ ] Add influencers
   - [ ] Run initial scraping
   - [ ] Generate wine images
   - [ ] Verify data quality

3. **Optional improvements**
   - [ ] Set up UptimeRobot
   - [ ] Configure custom domain
   - [ ] Add analytics
   - [ ] Share with friends!

---

## 🆙 When to Upgrade

**Upgrade to Render Starter ($7/month) if:**
- You have regular users (>10/day)
- Cold starts are unacceptable
- You want custom domain support
- Backend needs to run 24/7

**Upgrade MongoDB if:**
- You have >1000 wines (unlikely)
- You need more storage
- You want automated backups

**The free tier is perfect for personal use and testing!**

---

## 📚 Additional Resources

- [Render Free Tier Docs](https://render.com/docs/free)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)
- [OpenAI Pricing](https://openai.com/pricing)

---

## 🎉 You're Live for Free!

Your wine discovery platform is now running at:
- **Frontend**: `https://YOUR_USERNAME.github.io/vinly/`
- **Backend**: `https://vinly-backend.onrender.com`
- **API Docs**: `https://vinly-backend.onrender.com/docs`

**Monthly cost: $5-10** (just OpenAI usage, zero hosting fees!)

Enjoy discovering supermarket wines! 🍷✨

