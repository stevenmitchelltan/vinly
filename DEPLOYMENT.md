# 🚀 Deployment Guide

Step-by-step guide to deploy Vinly to production.

## Prerequisites Checklist

- [ ] MongoDB Atlas account created
- [ ] OpenAI API key obtained
- [ ] Railway account created
- [ ] GitHub repository created
- [ ] Instagram throwaway account created
- [ ] Dutch wine influencer Instagram handles identified

## Step 1: MongoDB Atlas Setup

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Verify email

2. **Create Cluster**
   - Click "Build a Database"
   - Select "Free" tier (M0)
   - Choose region closest to your users (e.g., EU-West for Netherlands)
   - Name your cluster (e.g., "vinly-cluster")
   - Click "Create"

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set permissions to "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your Railway IP (Railway will provide this)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Save this for later

## Step 2: OpenAI API Setup

1. **Create Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or login

2. **Add Payment Method**
   - Go to "Billing" → "Payment methods"
   - Add credit card (needed for API access)
   - Set spending limit (recommend $10-20/month for testing)

3. **Create API Key**
   - Go to "API Keys"
   - Click "Create new secret key"
   - Name it "Vinly Backend"
   - Copy and save the key (you won't see it again!)

## Step 3: Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repository
   - Select your Vinly repository

3. **Configure Root Directory**
   - Click on your service
   - Go to "Settings"
   - Set "Root Directory" to `backend`
   - Save

4. **Add Environment Variables**
   - Go to "Variables"
   - Add all required variables:
   
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/winedb?retryWrites=true&w=majority
   OPENAI_API_KEY=sk-your-api-key-here
   INSTAGRAM_USERNAME=your_instagram_username
   INSTAGRAM_PASSWORD=your_instagram_password
   CORS_ORIGINS=https://yourusername.github.io
   ```

5. **Deploy**
   - Railway auto-deploys on git push
   - Wait for deployment to complete
   - Click "Settings" → "Domains" → "Generate Domain"
   - Copy your Railway domain (e.g., `https://vinly-backend.up.railway.app`)

6. **Verify Deployment**
   - Visit `https://your-railway-domain.railway.app/health`
   - Should return `{"status": "healthy", "database": "connected"}`
   - Visit `https://your-railway-domain.railway.app/docs` for API docs

## Step 4: Seed Initial Data

1. **Install MongoDB Compass** (optional but helpful)
   - Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
   - Connect using your connection string

2. **Seed Influencers**
   - Edit `backend/scripts/seed_influencers.py`
   - Add real Dutch wine influencer Instagram handles
   - Run locally (connects to production MongoDB):
   
   ```bash
   cd backend
   python scripts/seed_influencers.py
   ```

3. **Trigger First Scrape**
   ```bash
   curl -X POST https://your-railway-domain.railway.app/api/admin/trigger-scrape
   ```
   
   - This will start scraping in the background
   - Check Railway logs to monitor progress

## Step 5: Frontend Deployment (GitHub Pages)

1. **Update Configuration**
   
   Edit `frontend/vite.config.js`:
   ```javascript
   base: '/vinly/', // Your repo name
   ```
   
   Edit `frontend/src/main.jsx`:
   ```javascript
   <BrowserRouter basename="/vinly">
   ```

2. **Create Production Environment File**
   
   Create `frontend/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-railway-domain.railway.app
   ```

3. **Install gh-pages**
   ```bash
   cd frontend
   npm install -D gh-pages
   ```

4. **Deploy to GitHub Pages**
   ```bash
   npm run build
   npm run deploy
   ```

5. **Configure GitHub Pages**
   - Go to your GitHub repository
   - Click "Settings" → "Pages"
   - Source: Select `gh-pages` branch
   - Click "Save"
   - Your site will be live at: `https://yourusername.github.io/vinly/`

6. **Update CORS in Backend**
   - Go to Railway → Variables
   - Update `CORS_ORIGINS` to include your GitHub Pages URL:
   ```
   CORS_ORIGINS=https://yourusername.github.io
   ```

## Step 6: Setup GitHub Actions

1. **Add Backend URL Secret**
   - Go to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `BACKEND_URL`
   - Value: `https://your-railway-domain.railway.app`
   - Click "Add secret"

2. **Verify Workflow**
   - Go to "Actions" tab
   - You should see "Daily Wine Scraping" workflow
   - Click "Run workflow" to test manually

## Step 7: Testing

1. **Test Backend**
   ```bash
   # Health check
   curl https://your-railway-domain.railway.app/health
   
   # Get wines
   curl https://your-railway-domain.railway.app/api/wines
   
   # Get supermarkets
   curl https://your-railway-domain.railway.app/api/supermarkets
   ```

2. **Test Frontend**
   - Visit `https://yourusername.github.io/vinly/`
   - Test all filters
   - Verify wines display correctly
   - Check that clicking Instagram links works

3. **Test Scraping**
   - Trigger manual scrape
   - Check Railway logs for progress
   - Verify wines appear in database
   - Check frontend updates

## Step 8: Monitoring

1. **Railway Logs**
   - View in Railway dashboard
   - Monitor for errors
   - Check scraping job output

2. **MongoDB Monitoring**
   - Use MongoDB Atlas dashboard
   - Monitor database size
   - Check query performance

3. **OpenAI Usage**
   - Check [platform.openai.com/usage](https://platform.openai.com/usage)
   - Monitor costs
   - Adjust spending limits if needed

## Troubleshooting

### Backend Won't Deploy
- Check Railway logs for errors
- Verify `Procfile` exists in backend directory
- Ensure all dependencies in `requirements.txt`

### Database Connection Fails
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure password is URL-encoded

### Frontend Shows CORS Errors
- Update `CORS_ORIGINS` in Railway
- Ensure it matches your GitHub Pages URL exactly
- Restart Railway service after changing

### Scraping Fails
- Check Instagram credentials
- Verify influencers exist in database
- Check Railway logs for specific errors
- Instagram may have rate limited or banned account

### No Wines Display
- Trigger manual scrape first
- Check if database has data
- Verify API calls work (check Network tab in browser)
- Check console for errors

## Cost Estimates

### Free Tier Limits
- **Railway**: 500 hours/month (always-on = ~730 hours, need to upgrade)
- **MongoDB Atlas**: 512MB storage
- **GitHub Pages**: Unlimited for public repos
- **OpenAI**: Pay-as-you-go

### Estimated Monthly Costs
- Railway: $5-10 (if exceeding free tier)
- OpenAI: $5-15 (depends on video volume)
- Total: ~$10-25/month

### Optimization Tips
- Limit scraping to 2-3 influencers initially
- Only transcribe videos if caption is insufficient
- Use caching to reduce duplicate API calls
- Monitor usage and adjust accordingly

## Production Checklist

Before going live:

- [ ] MongoDB Atlas configured with production credentials
- [ ] OpenAI API key set with spending limits
- [ ] Railway deployed and healthy
- [ ] GitHub Pages deployed successfully
- [ ] CORS properly configured
- [ ] Influencers seeded in database
- [ ] Initial scrape completed successfully
- [ ] Frontend displays wines correctly
- [ ] All filters working
- [ ] Mobile responsive
- [ ] Links to Instagram work
- [ ] About page reviewed
- [ ] Disclaimer added
- [ ] Monitoring setup
- [ ] Backup strategy for database

## Maintenance

### Daily
- Monitor Railway logs for errors
- Check if scheduled scrape ran successfully

### Weekly
- Review OpenAI usage and costs
- Check database storage usage
- Review wine data quality

### Monthly
- Clean up old/stale wines
- Review and update influencer list
- Check for broken scrapers
- Update dependencies

## Support

If you encounter issues:
1. Check Railway logs
2. Review MongoDB Atlas metrics
3. Test API endpoints manually
4. Check browser console for frontend errors
5. Open GitHub issue with details

---

Good luck with your deployment! 🍷

