# 🚀 Getting Started with Dockerized Vinly

**Quick guide to get up and running in under 5 minutes!**

---

## ⚡ Super Quick Start

### 1. Create `.env` file (30 seconds)

Create a file named `.env` in the project root with this content:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

Replace `sk-proj-your-actual-key-here` with your actual OpenAI API key.

**Get API key:** https://platform.openai.com/api-keys

### 2. Start Docker (1 command)

**Windows:**
```bash
docker-dev.bat
```

**Mac/Linux:**
```bash
chmod +x docker-dev.sh
./docker-dev.sh
```

**Or manually:**
```bash
docker-compose up
```

### 3. Access Your App

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Add Your First Wines

```bash
# In a new terminal:
docker exec -it vinly-backend bash

# Inside container:
python scripts/seed_tiktok_influencers.py
python scripts/smart_scraper.py pepijn.wijn
python scripts/check_wines.py
```

---

## ✅ That's It!

You're now running:
- ✅ FastAPI backend with all dependencies
- ✅ React frontend
- ✅ MongoDB database
- ✅ All in Docker containers!

---

## 📚 Next Steps

**Learn more:**
- Read `DOCKER_DEPLOYMENT.md` for production deployment
- Check `DOCKER_QUICK_REFERENCE.md` for Docker commands
- See `README.md` for project overview

**Deploy to production:**
1. Create MongoDB Atlas account (free)
2. Deploy to Render ($0 or $7/month)
3. Follow `DOCKER_DEPLOYMENT.md`

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
docker-compose down
docker-compose up
```

**Docker build fails?**
```bash
docker-compose build --no-cache
docker-compose up
```

**Missing .env?**
```bash
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

---

## 🆘 Need Help?

1. Check `DOCKER_DEPLOYMENT.md`
2. Check `DOCKER_QUICK_REFERENCE.md`
3. Check `ENV_SETUP_INSTRUCTIONS.md`
4. Open GitHub issue

---

**Made with 🍷 and 🐳!**

**Enjoy your Docker-powered wine discovery app! 🎉**

