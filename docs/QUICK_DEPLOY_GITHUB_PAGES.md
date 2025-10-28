# 🚀 GitHub Pages + Cloudinary Setup Guide

Quick guide to get your Vinly app deployed to GitHub Pages with Cloudinary image hosting.

## ⚡ Quick Setup (15 minutes)

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up (free - no credit card needed)
3. Note your credentials from dashboard:
   - **Cloud name**: (e.g., `dxyz123`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (long string shown in dashboard)

### 2. Add GitHub Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Add 4 secrets by clicking "New repository secret":

   ```
   Name: OPENAI_API_KEY
   Value: sk-proj-your-openai-key-here

   Name: CLOUDINARY_CLOUD_NAME
   Value: your-cloud-name

   Name: CLOUDINARY_API_KEY
   Value: your-api-key

   Name: CLOUDINARY_API_SECRET
   Value: your-api-secret
   ```

### 3. Enable GitHub Pages

1. Settings → Pages (left sidebar)
2. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/docs**
3. Click "Save"

Your site will be at: `https://yourusername.github.io/vinly/`

### 4. Initial Data Export

**If you have wines in Docker:**

```bash
# Start containers
docker-compose up -d

# Set Cloudinary credentials
docker-compose exec backend bash
export CLOUDINARY_CLOUD_NAME=your-cloud-name
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret

# Migrate images to Cloudinary
python scripts/migrate_images_to_cloudinary.py

# Export to JSON
python scripts/export_to_json.py
exit

# Commit and push
git add docs/wines.json
git commit -m "Initial wine data export"
git push
```

**If starting fresh:**
- Just push your code
- GitHub Actions will create wines.json automatically

### 5. Trigger First Update

1. Go to Actions tab in GitHub
2. Click "Update Wine Data"
3. Click "Run workflow" button
4. Wait ~20-30 minutes
5. Check your site at `yourusername.github.io/vinly`

## ✅ Verification

**Check if everything works:**

```bash
# 1. Check wines.json exists
curl -I https://yourusername.github.io/vinly/wines.json

# 2. Count wines
curl https://yourusername.github.io/vinly/wines.json | jq length

# 3. Check image URLs (should be Cloudinary)
curl https://yourusername.github.io/vinly/wines.json | jq '.[0].image_urls[0]'
# Should output: "https://res.cloudinary.com/..."
```

**Visit your site:**
- Main page: `https://yourusername.github.io/vinly/`
- Wines JSON: `https://yourusername.github.io/vinly/wines.json`

## 🔄 Automatic Updates

**Configured to run every Sunday at 2am UTC:**
- Scrapes TikTok for new wines
- Transcribes and extracts data
- Uploads images to Cloudinary
- Updates wines.json
- Deploys to GitHub Pages

**No action needed on your part!**

## 📊 What You Get

**Free tier includes:**
- GitHub Pages: Unlimited hosting
- GitHub Actions: 2000 minutes/month
- Cloudinary: 25GB storage + 25GB bandwidth
- **Only cost:** OpenAI API (~$5-10/month)

**Performance:**
- Static site loads instantly
- Images served from global CDN
- No backend cold starts
- Fast worldwide

## 🛠️ Common Issues

**"wines.json not found"**
- Wait 2-3 minutes after push (GitHub Pages deploy time)
- Check Actions tab for workflow status

**"Images not loading"**
- Check Cloudinary credentials in GitHub Secrets
- View browser console for CORS errors
- Verify image URLs in wines.json are Cloudinary URLs

**"Workflow failed"**
- Click on failed workflow → View logs
- Common: OpenAI API key or credits issue
- Check secrets are correct (no extra spaces)

## 📚 Full Documentation

- [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md) - Complete guide
- [START_HERE.md](../START_HERE.md) - Local development
- [README.md](../README.md) - Project overview

## 🎉 You're Done!

Your wine discovery app is now:
- ✅ Hosted on GitHub Pages (free)
- ✅ Images on Cloudinary CDN (free)
- ✅ Auto-updating weekly (free)
- ✅ Fast global delivery
- ✅ Zero backend maintenance

**Total setup time:** 15 minutes  
**Monthly cost:** $5-10 (just OpenAI)

Enjoy your fully automated wine recommendation system! 🍷

