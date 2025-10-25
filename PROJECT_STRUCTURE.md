# 📁 Vinly - Project Structure

Clean, organized project structure with clear separation of concerns.

## 🗂️ Root Directory

```
vinly/
├── backend/              # Python FastAPI backend
├── frontend/             # React frontend
├── docs/                 # All documentation
├── README.md             # Main project readme
├── LICENSE               # MIT license
├── PROJECT_STRUCTURE.md  # This file
├── quickstart.bat        # Windows quick start
└── quickstart.sh         # Mac/Linux quick start
```

## 🐍 Backend Structure

```
backend/
├── app/                  # Application code
│   ├── api/              # API routes
│   │   ├── admin.py      # Admin endpoints
│   │   ├── health.py     # Health check
│   │   ├── status.py     # Status monitoring
│   │   └── wines.py      # Wine endpoints
│   ├── jobs/             # Background jobs
│   │   └── daily_scraper.py
│   ├── scrapers/         # Scraping services
│   │   └── tiktok_oembed_scraper.py
│   ├── services/         # Business logic
│   │   ├── wine_extractor.py      # AI extraction
│   │   ├── inventory_updater.py   # Inventory mgmt
│   │   └── tiktok_audio.py        # Audio handling
│   ├── utils/            # Utilities
│   │   └── config_loader.py       # YAML loader
│   ├── config.py         # App configuration
│   ├── database.py       # MongoDB connection
│   ├── main.py           # FastAPI app
│   ├── models.py         # Pydantic models
│   └── scheduler.py      # Job scheduler
│
├── config/               # YAML configurations
│   ├── supermarkets.yaml       # Supermarket definitions
│   ├── wine_keywords.yaml      # Wine terminology
│   ├── scraping_settings.yaml  # Scraper settings
│   └── README.md              # Config documentation
│
├── scripts/              # Utility scripts
│   ├── smart_scraper.py        # Main scraper (USE THIS)
│   ├── check_wines.py          # Check database
│   ├── seed_tiktok_influencers.py
│   ├── auto_scrape_tiktok_profile.py
│   ├── monitor_scraping.py
│   └── tests/                  # Test & utility scripts
│       ├── add_test_wines.py
│       ├── test_*.py
│       └── get_*.py
│
├── requirements.txt      # Python dependencies
├── Procfile             # Railway deployment
└── README.md            # Backend documentation
```

## ⚛️ Frontend Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── WineCard.jsx
│   │   ├── WineGrid.jsx
│   │   ├── SupermarketSelector.jsx
│   │   └── WineTypeFilter.jsx
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── App.jsx              # Main app
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite config
├── tailwind.config.js      # Tailwind config
└── README.md               # Frontend docs
```

## 📚 Documentation Structure

```
docs/
├── README.md                   # Documentation index
├── QUICK_START_GUIDE.md        # Getting started
├── DEPLOYMENT.md               # Production deployment
├── CONFIGURATION_GUIDE.md      # Customization
├── SYSTEM_COMPLETE.md          # Feature documentation
├── PROCESS_FLOW.md             # System architecture
├── PROJECT_OVERVIEW.md         # Project summary
├── IMPROVEMENTS.md             # Optimizations
├── QUICK_REFERENCE.md          # Command cheat sheet
├── FINAL_SUMMARY.md            # Implementation summary
└── CONTRIBUTING.md             # Contribution guide
```

## 🎯 Key Files

### Essential Files (Don't Delete!)

**Backend:**
- `app/main.py` - FastAPI application entry point
- `app/config.py` - Environment configuration
- `app/database.py` - MongoDB connection
- `app/models.py` - Data models
- `config/*.yaml` - All configuration files
- `scripts/smart_scraper.py` - Main scraping script
- `requirements.txt` - Python dependencies

**Frontend:**
- `src/main.jsx` - React entry point
- `src/App.jsx` - Main React component
- `src/services/api.js` - API client
- `package.json` - Node dependencies
- `vite.config.js` - Build configuration

**Configuration:**
- `.env` (create this!) - Environment variables
- `.gitignore` - Git exclusions

### Utility Files (Safe to Modify)

- `scripts/tests/*` - Test and utility scripts
- `docs/*` - All documentation
- `README.md` - Update as needed

### Generated Files (Gitignored)

- `__pycache__/` - Python bytecode
- `node_modules/` - Node packages
- `venv/` - Python virtual environment
- `dist/` - Build output
- `.env` - Environment variables
- `session-*` - Session files

## 📝 File Organization Rules

### ✅ DO:
- Keep production code in `app/`
- Keep utilities in `scripts/`
- Keep tests in `scripts/tests/`
- Keep docs in `docs/`
- Keep configs in `config/`

### ❌ DON'T:
- Put scripts in `app/`
- Mix test code with production code
- Commit `.env` files
- Commit session files
- Keep temporary files in root

## 🔍 Finding What You Need

**"I want to..."**

- **Add a new API endpoint** → `backend/app/api/`
- **Change wine extraction logic** → `backend/app/services/wine_extractor.py`
- **Add a supermarket** → `backend/config/supermarkets.yaml`
- **Add wine keywords** → `backend/config/wine_keywords.yaml`
- **Modify scraping** → `backend/scripts/smart_scraper.py`
- **Change frontend UI** → `frontend/src/components/`
- **Add a new page** → `frontend/src/pages/`
- **Update API calls** → `frontend/src/services/api.js`
- **Read documentation** → `docs/`
- **Run tests** → `backend/scripts/tests/`

## 🧹 Keeping It Clean

### Regular Cleanup

```bash
# Remove Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +

# Remove temp files
rm -rf backend/temp/*

# Check for orphaned files
git status
```

### What's Gitignored

- Python: `__pycache__/`, `*.pyc`, `venv/`
- Node: `node_modules/`, `dist/`, `*.local`
- Environment: `.env`, `.env.local`
- Temporary: `temp/`, `*.log`, `session-*`
- TikTok cache: `tiktok_videos_*.txt`

## 📊 Code Metrics

**Current Size:**
- Backend: ~2,500 lines of Python
- Frontend: ~1,200 lines of React/JS
- Configuration: ~200 lines of YAML
- Documentation: ~3,000 lines of Markdown
- Tests: ~800 lines of Python

**Files Count:**
- Backend: 25 Python files
- Frontend: 15 JS/JSX files
- Config: 3 YAML files
- Docs: 11 Markdown files
- Scripts: 12 utility scripts

---

**Keep it clean! 🧹**

