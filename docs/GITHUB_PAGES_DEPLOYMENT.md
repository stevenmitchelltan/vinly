# 🚀 GitHub Pages Deployment Guide

Complete guide to deploying Vinly as a fully static site on GitHub Pages with Cloudinary CDN.

---

## 🎯 Architecture Overview

**Fully Static Deployment:**
- **Frontend**: GitHub Pages (free, fast CDN)
- **Wine Data**: Static JSON file (`docs/wines.json`)
- **Images**: Cloudinary CDN (25GB free)
- **Updates**: GitHub Actions (automated weekly scraping)
- **Cost**: $0 hosting + ~$5-10/month OpenAI API usage

**How It Works:**
```
GitHub Actions (Every Sunday 2am)
  ↓
  1. Scrape TikTok with Playwright
  2. Transcribe videos with OpenAI Whisper
  3. Extract wines with GPT-4o-mini
  4. Extract frames and upload to Cloudinary
  5. Export wines.json
  6. Commit and push to GitHub
  ↓
GitHub Pages auto-deploys (2-3 minutes)
  ↓
Users load wines instantly from CDN
```

---

## 📋 Prerequisites

### 1. Cloudinary Account (Free)
- Sign up at https://cloudinary.com
- Free tier includes:
  - 25GB storage
  - 25GB bandwidth/month
  - ~10,000 wine images capacity

### 2. OpenAI API Key
- Get from https://platform.openai.com/api-keys
- Weekly cost: ~$3-5 for transcription + extraction

### 3. GitHub Repository
- Push your code to GitHub
- Enable Actions (Settings → Actions → Allow all actions)

---

## 🔧 Setup Instructions

### Step 1: Configure Cloudinary

1. **Sign up and get credentials:**
   - Go to https://cloudinary.com and create account
   - Dashboard shows your:
     - Cloud name
     - API key
     - API secret

2. **Create upload preset:**
   - Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Name: `vinly-wines`
   - Signing Mode: Signed
   - Save

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `OPENAI_API_KEY` | sk-proj-... | https://platform.openai.com/api-keys |
| `CLOUDINARY_CLOUD_NAME` | your-cloud-name | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | 123456789012345 | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | abc...xyz | Cloudinary Dashboard → API Keys |

### Step 3: Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages" (left sidebar)
3. Configure:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /docs
4. Click "Save"
5. Your site will be at: `https://yourusername.github.io/vinly/`

### Step 4: Initial Data Migration

**If you have existing wines and images in Docker:**

```bash
# 1. Make sure Docker containers are running
docker-compose up -d

# 2. Set Cloudinary credentials in .env
echo "CLOUDINARY_CLOUD_NAME=your-cloud-name" >> backend/.env
echo "CLOUDINARY_API_KEY=your-api-key" >> backend/.env
echo "CLOUDINARY_API_SECRET=your-api-secret" >> backend/.env

# 3. Migrate existing images to Cloudinary
docker exec vinly-backend python scripts/migrate_images_to_cloudinary.py

# 4. Export wines to JSON
docker exec vinly-backend python scripts/export_to_json.py

# 5. Commit and push
git add docs/wines.json
git commit -m "Initial wine data export"
git push
```

**If starting fresh:**
- GitHub Actions will create wines.json on first run
- Manual trigger: Go to Actions tab → Update Wine Data → Run workflow

---

## 🔄 How Updates Work

### Automatic (Recommended)

**Every Sunday at 2am UTC:**
1. GitHub Actions triggers automatically
2. Scrapes new wines from TikTok
3. Processes and uploads to Cloudinary
4. Updates wines.json
5. Commits changes
6. GitHub Pages deploys new version

**View status:**
- GitHub repo → Actions tab
- See workflow runs and logs

### Manual Updates

**Trigger scraping manually:**
1. Go to repo → Actions tab
2. Click "Update Wine Data" workflow
3. Click "Run workflow" button
4. Select branch (main)
5. Click "Run workflow"
6. Wait ~20-30 minutes for completion

**Check progress:**
- Workflow run page shows real-time logs
- Successful run = green checkmark
- Failed run = red X with error logs

---

## 📊 Monitoring

### Check if Site is Live

1. Visit: `https://yourusername.github.io/vinly/`
2. Should see wine grid
3. Check browser console (F12) for errors

### Verify Data Updates

```bash
# Check wines.json age
curl -I https://yourusername.github.io/vinly/wines.json | grep Last-Modified

# Download and count wines
curl https://yourusername.github.io/vinly/wines.json | jq length
```

### View GitHub Actions Logs

1. Repo → Actions tab
2. Click on a workflow run
3. Click on "scrape-and-update" job
4. Expand steps to see detailed logs

---

## 🔧 Troubleshooting

### Wines Not Updating

**Check:**
1. GitHub Actions succeeded? (green checkmark)
2. wines.json committed? Check commits history
3. GitHub Pages deployed? Settings → Pages shows deploy time
4. Browser cache? Hard refresh (Ctrl+Shift+R)

**Solution:**
```bash
# Check Actions logs for errors
# Common issues:
# - OPENAI_API_KEY invalid or out of credits
# - CLOUDINARY secrets incorrect
# - TikTok blocking scraper
```

### Images Not Loading

**Check:**
1. Open browser console (F12)
2. Look for CORS errors or 404s
3. Verify Cloudinary URLs in wines.json

**Test Cloudinary:**
```bash
# Verify upload works
docker exec vinly-backend python -c "
from app.services.cloudinary_upload import configure_cloudinary
configure_cloudinary()
print('✅ Cloudinary configured')
"
```

### GitHub Actions Failing

**Common errors:**

1. **"API rate limit exceeded"**
   - Wait 1 hour and try again
   - Or use GitHub token with higher limits

2. **"OpenAI API error"**
   - Check API key is valid
   - Verify you have credits: https://platform.openai.com/usage
   - Check quota limits

3. **"Playwright install failed"**
   - Usually temporary GitHub issue
   - Re-run workflow

4. **"MongoDB connection failed"**
   - Check MongoDB container started in workflow logs
   - Wait longer in workflow (increase sleep time)

---

## 💰 Cost Breakdown

### Free Tier (Recommended)

| Service | Cost | Limits |
|---------|------|--------|
| **GitHub Pages** | $0 | 100GB bandwidth/month |
| **GitHub Actions** | $0 | 2000 minutes/month |
| **Cloudinary** | $0 | 25GB storage + bandwidth |
| **OpenAI API** | ~$5-10/month | Pay per use |
| **Total** | ~$5-10/month | Just OpenAI costs |

### Usage Estimates

**Per weekly scrape:**
- GitHub Actions: ~30 minutes
- OpenAI Whisper: ~$1-2 (transcription)
- OpenAI GPT-4o-mini: ~$0.50 (extraction)
- Cloudinary: ~50MB uploads
- **Total per week**: ~$2-3

**Monthly:**
- 4 weekly scrapes = ~$8-12/month
- Well within all free tier limits

---

## 🎯 Advanced Configuration

### Change Scraping Schedule

Edit `.github/workflows/update-wines.yml`:

```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2am UTC
    # - cron: '0 14 * * 1'  # Every Monday at 2pm UTC
    # - cron: '0 2 * * *'  # Every day at 2am UTC
```

### Add More Influencers

Edit `backend/scripts/seed_tiktok_influencers.py`:

```python
influencers = [
    {
        "username": "pepijn.wijn",
        "display_name": "Pepijn Wijn",
        "is_active": True
    },
    {
        "username": "another.wine.expert",
        "display_name": "Another Expert",
        "is_active": True
    }
]
```

### Customize Data Fields

Edit `backend/scripts/export_to_json.py` to include/exclude fields:

```python
wine_data = {
    'id': str(wine['_id']),
    'name': wine['name'],
    # Add custom fields here
    'custom_field': wine.get('custom_field'),
}
```

---

## 🔒 Security Notes

- ✅ All secrets stored in GitHub Secrets (encrypted)
- ✅ API keys never exposed in code or logs
- ✅ MongoDB temporary (destroyed after each run)
- ✅ Cloudinary images are public (wine images, no sensitive data)
- ⚠️  Don't commit `.env` files
- ⚠️  Don't print secrets in workflow logs

---

## 📚 Related Documentation

- [START_HERE.md](../START_HERE.md) - Quick start guide
- [GETTING_STARTED.md](../GETTING_STARTED.md) - Detailed setup
- [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md) - Docker deployment (alternative)
- [DOCKER_QUICK_REFERENCE.md](../DOCKER_QUICK_REFERENCE.md) - Docker commands

---

## ✅ Deployment Checklist

- [ ] Cloudinary account created
- [ ] Upload preset "vinly-wines" created
- [ ] GitHub Secrets added (4 secrets)
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Existing images migrated (if any)
- [ ] wines.json exported and committed
- [ ] Site accessible at github.io URL
- [ ] First manual workflow triggered successfully
- [ ] Wines displaying on website
- [ ] Images loading from Cloudinary
- [ ] Weekly schedule confirmed

---

**🎉 Congratulations!** Your Vinly app is now fully deployed on GitHub Pages with zero backend costs!

Questions? Check the troubleshooting section or create an issue on GitHub.

