# 🔧 Environment Variables Setup Instructions

This file contains the content for `.env.example` files that need to be created.

---

## Root Directory: `.env.example`

Create this file in the **project root** directory:

**File:** `.env.example`

```bash
# Vinly Environment Variables for Docker Compose
# Copy this file to .env and fill in your actual values

# ============================================
# OpenAI API Key (Required)
# ============================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# ============================================
# MongoDB (Local Development - Already configured in docker-compose.yml)
# ============================================
# For local development, MongoDB runs in a Docker container
# The connection string is already set in docker-compose.yml
# No need to change these unless you want custom credentials

# ============================================
# Optional: Production MongoDB Atlas
# ============================================
# If deploying to production, use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vinly?retryWrites=true&w=majority
```

---

## Backend Directory: `backend/.env.example`

Create this file in the **backend/** directory:

**File:** `backend/.env.example`

```bash
# Vinly Backend Environment Variables
# Copy this file to .env and fill in your actual values
# NEVER commit the .env file to git!

# ============================================
# MongoDB Database
# ============================================
# Local development (docker-compose):
# MONGODB_URI=mongodb://admin:vinly-local-dev@mongodb:27017/vinly?authSource=admin

# Production (MongoDB Atlas):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vinly?retryWrites=true&w=majority
MONGODB_URI=your_mongodb_connection_string_here

# ============================================
# OpenAI API
# ============================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# ============================================
# CORS Configuration
# ============================================
# Allowed origins for CORS (comma-separated)
# Local development:
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:80

# Production:
# CORS_ORIGINS=https://your-app.onrender.com,https://your-domain.com

# ============================================
# Optional: Instagram (if using Instagram scraping)
# ============================================
INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=

# ============================================
# Optional: Cloudinary (if using Cloudinary for image hosting)
# ============================================
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ============================================
# Application Settings
# ============================================
# Environment: development, staging, production
ENVIRONMENT=development

# Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
```

---

## Quick Setup Steps

### For Local Development:

**1. Create `.env` in project root:**
```bash
# Windows
copy ENV_SETUP_INSTRUCTIONS.md .env
# Then edit .env and keep only the OPENAI_API_KEY line

# Mac/Linux
touch .env
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

**2. Add your actual OpenAI API key:**
- Get it from: https://platform.openai.com/api-keys
- Replace `sk-proj-your-key-here` with your actual key

**3. Start Docker:**
```bash
docker-compose up
```

That's it! MongoDB is auto-configured in docker-compose.yml.

---

### For Production (Render):

**Don't need .env files for production!**

Instead, set environment variables in Render Dashboard:
1. Go to your service → **Environment** tab
2. Add variables:
   - `OPENAI_API_KEY`: Your OpenAI key
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGINS`: https://vinly-backend.onrender.com
   - `ENVIRONMENT`: production
   - `LOG_LEVEL`: INFO

---

## ⚠️ Important Security Notes

1. **NEVER commit `.env` files to git!**
   - Already in `.gitignore` ✅
   - Always use `.env.example` for templates

2. **Use different keys for development and production**
   - Local: One OpenAI API key
   - Production: Different OpenAI API key (easier to track usage)

3. **Rotate credentials regularly**
   - OpenAI keys: Monthly
   - MongoDB passwords: Quarterly

4. **Set OpenAI spending limits**
   - Go to: https://platform.openai.com/account/billing/limits
   - Set hard limit: $10-20/month
   - Set email alerts: 50%, 75%, 100%

---

## ✅ Verification

**After creating `.env`:**

```bash
# Check if file exists (should not show in git)
git status
# Should NOT show .env file

# Verify Docker can read it
docker-compose config
# Should show OPENAI_API_KEY value

# Start services
docker-compose up
# Should start without errors
```

---

**Need help?** See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete guide.

