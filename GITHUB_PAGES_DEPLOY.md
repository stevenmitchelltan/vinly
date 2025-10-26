# 🌐 GitHub Pages Deployment Guide

Deploy Vinly's frontend to GitHub Pages **for FREE!** ✨

---

## 🎯 **What You'll Deploy**

| Component | Where | Cost |
|-----------|-------|------|
| **Frontend** | GitHub Pages | **FREE** 🎉 |
| **Backend** | Render Free Tier | **FREE** (with sleep) or $7/month |
| **Database** | MongoDB Atlas | **FREE** |

**Total: $0/month** (completely free!) or $0-7/month for always-on backend

💡 **Want completely free hosting?** See [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md) for Render Free Tier setup!

---

## 🚀 **Quick Deploy (2 Methods)**

### **Method 1: Automatic (GitHub Actions)** ⚡ Recommended

**Setup once, deploys automatically on every push!**

#### Step 1: Enable GitHub Pages
1. Go to your GitHub repo → **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Click **Save**

#### Step 2: Add Backend URL Secret
1. In your repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   ```
   Name: VITE_API_BASE_URL
   Value: https://vinly-backend.onrender.com
   ```
   (Use your actual backend URL once deployed)

#### Step 3: Deploy
```bash
# Just push to main!
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

**That's it!** GitHub Actions will automatically:
- Build your frontend
- Deploy to GitHub Pages
- Your site will be live at: `https://YOUR_USERNAME.github.io/vinly/`

---

### **Method 2: Manual Deploy** 🔧

**For quick one-time deploys**

#### Step 1: Install dependencies
```bash
cd frontend
npm install
```

#### Step 2: Build
```bash
# Set your backend URL
export VITE_API_BASE_URL=https://vinly-backend.onrender.com

# Build
npm run build
```

#### Step 3: Deploy
```bash
# Deploy to gh-pages branch
npm run deploy
```

**Done!** Your site is live at: `https://YOUR_USERNAME.github.io/vinly/`

---

## ⚙️ **Full Setup (Frontend + Backend)**

### 1. **Deploy Backend First** (Required)

You need a backend server for:
- Wine data API
- Transcription processing
- Image serving
- Scheduled scraping

**Recommended: Render (Free or Paid)**

**Option A: Render Free Tier ($0/month)**
- Backend sleeps after 15 min inactivity
- 50 second cold start on first request
- Perfect for personal projects
- See: [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md)

**Option B: Render Starter ($7/month)**
- Always-on, no cold starts
- Better for production use
- See: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

Choose based on your needs and follow the appropriate guide!

### 2. **Configure Frontend**

Update `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://vinly-backend.onrender.com
```

Or set as GitHub Secret (see Method 1 above).

### 3. **Update Backend CORS**

In Render backend environment variables, set:
```bash
CORS_ORIGINS=https://YOUR_USERNAME.github.io
```

### 4. **Deploy Frontend**

Push to GitHub (automatic) or run `npm run deploy` (manual).

---

## 🔄 **Deployment Flow**

```
┌─────────────────────────────────────────────────────┐
│  You push code to GitHub (main branch)             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  GitHub Actions detects frontend changes           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Installs dependencies (npm ci)                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Builds React app (npm run build)                  │
│  - Uses VITE_API_BASE_URL from secrets             │
│  - Optimizes for production                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Deploys to GitHub Pages                           │
│  - Site live at: username.github.io/vinly/         │
└─────────────────────────────────────────────────────┘
```

---

## 🌐 **Custom Domain** (Optional)

Want `vinly.nl` instead of `username.github.io/vinly/`?

### Step 1: Update Vite Config
```javascript
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/', // Change from '/vinly/' to '/'
  server: {
    port: 5173
  }
})
```

### Step 2: Add CNAME
```bash
# Create frontend/public/CNAME
echo "vinly.nl" > frontend/public/CNAME
```

### Step 3: Configure DNS
In your domain registrar (e.g., Namecheap):

**A Records:**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Or CNAME Record:**
```
CNAME: YOUR_USERNAME.github.io
```

### Step 4: Enable in GitHub
1. Repo → **Settings** → **Pages**
2. Custom domain: `vinly.nl`
3. Check "Enforce HTTPS"

---

## ✅ **Verify Deployment**

### Check Frontend
```bash
# Visit your site
https://YOUR_USERNAME.github.io/vinly/

# Should see:
✓ Vinly logo 🍷
✓ Filters (supermarket, wine type)
✓ Wine cards with images
```

### Check Backend Connection
Open browser console (F12) and look for:
```
✓ No CORS errors
✓ API calls to your backend URL
✓ Wine data loading
```

### Test API
```bash
curl https://vinly-backend.onrender.com/health
# Expected: {"status":"healthy","database":"connected"}
```

---

## 🐛 **Troubleshooting**

### Issue: Blank page after deploy
**Fix:** Check `base` in `vite.config.js`
```javascript
base: '/vinly/', // Must match your repo name
```

### Issue: CORS errors
**Fix:** Update backend `CORS_ORIGINS`:
```bash
# In Render environment variables:
CORS_ORIGINS=https://YOUR_USERNAME.github.io
```

### Issue: Images not loading
**Fix:** Check API URL in frontend:
```bash
# In GitHub Secrets or .env.production:
VITE_API_BASE_URL=https://vinly-backend.onrender.com
```

### Issue: 404 on page refresh
**Fix:** GitHub Pages doesn't support client-side routing by default.

Add `frontend/public/404.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/vinly/'">
  </head>
</html>
```

And update `frontend/index.html`:
```html
<script>
  (function(){
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect != location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

---

## 💰 **Cost Comparison**

### Option 1: GitHub Pages + Render Free Tier (Recommended for Personal Use)
- Frontend: **FREE** (GitHub Pages)
- Backend: **FREE** (Render Free Tier - sleeps after 15 min)
- Database: **FREE** (MongoDB Atlas M0)
- OpenAI API: ~$5-10/month (usage-based)
- **Total: $5-10/month** ⭐ Only pay for AI usage!
- See: [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md)

### Option 2: GitHub Pages + Render Starter (Recommended for Production)
- Frontend: **FREE** (GitHub Pages)
- Backend: **$7/month** (Render Starter - always-on)
- Database: **FREE** (MongoDB Atlas M0)
- OpenAI API: ~$5-10/month
- **Total: $12-17/month**
- See: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

### Option 3: All Vercel
- Frontend: **FREE**
- Backend: Doesn't support Python well
- **Not recommended for this stack**

### Option 4: All Render
- Frontend: **FREE** (static site)
- Backend: $7/month
- **Total: $7/month**

---

## 📊 **GitHub Pages Limits**

| Resource | Limit | Your Usage | OK? |
|----------|-------|------------|-----|
| **Repo size** | 1 GB | ~50 MB | ✅ |
| **Site size** | 1 GB | ~2 MB | ✅ |
| **Bandwidth** | 100 GB/month | ~1-5 GB | ✅ |
| **Builds** | 10/hour | 1-2/hour max | ✅ |

**You're well within limits!** 🎉

---

## 🎯 **Next Steps**

After deployment:

1. **Test everything**:
   - [ ] Frontend loads
   - [ ] Wines display
   - [ ] Filters work
   - [ ] Images show
   - [ ] Mobile works
   - [ ] Carousel swipes

2. **Share your app**:
   - Post on social media
   - Share with wine lovers
   - Get feedback

3. **Monitor usage**:
   - Check GitHub Pages analytics
   - Monitor backend logs in Render
   - Track OpenAI API costs

4. **Add features**:
   - More influencers
   - User favorites
   - Reviews/ratings

---

## 🆘 **Need Help?**

**Deployment failing?**
- Check GitHub Actions logs (Actions tab)
- Verify `VITE_API_BASE_URL` secret is set
- Make sure `base: '/vinly/'` matches your repo name

**Backend connection issues?**
- Verify backend is deployed (test `/health` endpoint)
- Check CORS settings in backend
- Look for errors in browser console (F12)

**Cold starts too slow?**
- See [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md) for UptimeRobot setup
- Or upgrade to Render Starter ($7/month) for always-on

**Still stuck?**
- Check [GitHub Pages docs](https://docs.github.com/pages)
- Check [Render Free Tier docs](https://render.com/docs/free)
- Review [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🎉 **Success!**

Your wine discovery platform is now live on GitHub Pages!

**URLs:**
- **Frontend**: `https://YOUR_USERNAME.github.io/vinly/`
- **Backend**: `https://vinly-backend.onrender.com`
- **API Docs**: `https://vinly-backend.onrender.com/docs`

**Monthly Cost:**
- **Free tier**: $5-10 (only OpenAI API usage!) 💰
- **With always-on backend**: $12-17

**Deployment Guides:**
- **Free hosting**: See [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md)
- **Paid hosting**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) or [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Share your app and enjoy discovering wines! 🍷✨

