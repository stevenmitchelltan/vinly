# 📚 Vinly Documentation

Welcome to the Vinly documentation! This folder contains all guides and detailed documentation.

## 📖 Documentation Index

### Getting Started

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get Vinly running in 5 minutes
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to production (Railway + GitHub Pages)

### Configuration & Customization

- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Customize keywords, supermarkets, and settings
- **[Wine Keywords](../backend/config/wine_keywords.yaml)** - Edit wine terminology
- **[Supermarkets](../backend/config/supermarkets.yaml)** - Add supermarkets or aliases
- **[Settings](../backend/config/scraping_settings.yaml)** - Adjust scraping parameters

### System Documentation

- **[System Complete](SYSTEM_COMPLETE.md)** - Complete feature documentation
- **[Process Flow](PROCESS_FLOW.md)** - Detailed system architecture
- **[Project Overview](PROJECT_OVERVIEW.md)** - High-level project summary
- **[Improvements](IMPROVEMENTS.md)** - System improvements and optimizations

### Reference

- **[Quick Reference](QUICK_REFERENCE.md)** - Command cheat sheet
- **[Final Summary](FINAL_SUMMARY.md)** - Implementation summary
- **[Contributing](CONTRIBUTING.md)** - How to contribute to Vinly

## 🎯 Quick Navigation

**I want to...**

- **Get started quickly** → [Quick Start Guide](QUICK_START_GUIDE.md)
- **Deploy to production** → [Deployment Guide](DEPLOYMENT.md)
- **Add supermarket aliases** → [Configuration Guide](CONFIGURATION_GUIDE.md)
- **Understand how it works** → [Process Flow](PROCESS_FLOW.md)
- **See all features** → [System Complete](SYSTEM_COMPLETE.md)
- **Find command examples** → [Quick Reference](QUICK_REFERENCE.md)
- **Contribute code** → [Contributing](CONTRIBUTING.md)

## 📝 Documentation Structure

```
docs/
├── README.md (this file)           # Documentation index
├── QUICK_START_GUIDE.md            # Getting started
├── DEPLOYMENT.md                   # Production deployment
├── CONFIGURATION_GUIDE.md          # Customization guide
├── SYSTEM_COMPLETE.md              # Complete features
├── PROCESS_FLOW.md                 # System architecture
├── PROJECT_OVERVIEW.md             # Project summary
├── IMPROVEMENTS.md                 # Optimizations
├── QUICK_REFERENCE.md              # Command reference
├── FINAL_SUMMARY.md                # Implementation summary
└── CONTRIBUTING.md                 # Contribution guide
```

## 🆘 Need Help?

1. Check the [Quick Start Guide](QUICK_START_GUIDE.md) first
2. Look at [Common Issues](#common-issues) below
3. Review the [Process Flow](PROCESS_FLOW.md) to understand the system
4. Check configuration in YAML files

### Common Issues

**MongoDB Connection Failed:**
- Check your `MONGODB_URI` in `backend/.env`
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)

**OpenAI API Error:**
- Verify `OPENAI_API_KEY` in `backend/.env`
- Check your OpenAI account has credits ($5 minimum recommended)

**TikTok Scraping Timeout:**
- Normal for large profiles (241 videos takes ~2 minutes)
- Check your internet connection
- Videos are processed incrementally, check database with `python scripts/check_wines.py`

**Frontend Can't Connect to Backend:**
- Ensure backend is running on http://localhost:8000
- Check `VITE_API_BASE_URL` in `frontend/.env.local`
- Verify CORS settings in `backend/.env`

## 🔄 Keep Documentation Updated

When adding new features:
1. Update relevant documentation files
2. Update this index if needed
3. Keep examples current
4. Test all command examples

---

**Happy documenting! 🍷**

