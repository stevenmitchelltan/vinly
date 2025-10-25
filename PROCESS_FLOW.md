# 🍷 Vinly - Complete Process Flow

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Automated Scraping Flow](#automated-scraping-flow)
3. [Data Flow](#data-flow)
4. [User Experience Flow](#user-experience-flow)
5. [Technical Architecture](#technical-architecture)
6. [File Responsibilities](#file-responsibilities)

---

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      VINLY WINE APP                          │
│                                                              │
│  TikTok → Scraper → AI Extraction → Database → Frontend     │
└─────────────────────────────────────────────────────────────┘
```

### **Components:**
1. **TikTok** - Source of wine reviews
2. **Automated Scraper** - Gets video URLs and descriptions
3. **AI Extraction** - Extracts wine data from descriptions
4. **MongoDB** - Stores wines
5. **FastAPI Backend** - Serves wine data via API
6. **React Frontend** - Displays wines to users

---

## 🤖 Automated Scraping Flow

### **Step-by-Step Process:**

```
1. RUN COMMAND
   └─> python scripts/auto_scrape_tiktok_profile.py pepijn.wijn

2. FIND VIDEOS (Playwright)
   ├─> Launch headless Chrome browser
   ├─> Navigate to https://www.tiktok.com/@pepijn.wijn
   ├─> Wait for page to load (5 seconds)
   ├─> Extract video URLs from page DOM
   └─> Return list of 36 video URLs

3. SCRAPE VIDEO DATA (oEmbed API)
   ├─> For each video URL:
   │   ├─> Call: https://www.tiktok.com/oembed?url={VIDEO_URL}
   │   ├─> Get JSON response with:
   │   │   ├─> title (description/caption)
   │   │   ├─> author_name
   │   │   └─> thumbnail_url
   │   └─> Store video data
   └─> Return 36 video objects

4. EXTRACT WINE DATA (GPT-4o-mini)
   ├─> For each video description:
   │   ├─> Check if description > 20 characters
   │   ├─> Send to OpenAI GPT-4o-mini:
   │   │   ├─> Prompt: "Extract wine info from Dutch text"
   │   │   ├─> Parse response JSON
   │   │   └─> Get: name, supermarket, type, rating, description
   │   └─> Return wine objects
   └─> Found 2 wines from 36 videos

5. SAVE TO DATABASE (MongoDB)
   ├─> For each wine:
   │   ├─> Check if wine already exists (name + supermarket)
   │   ├─> If NEW:
   │   │   ├─> Create wine document:
   │   │   │   ├─> name: "GRAND BATEAU - Beychevelle 2023"
   │   │   │   ├─> supermarket: "Jumbo"
   │   │   │   ├─> wine_type: "red"
   │   │   │   ├─> image_url: (TikTok thumbnail)
   │   │   │   ├─> rating: "..."
   │   │   │   ├─> description: "..."
   │   │   │   ├─> influencer_source: "pepijn.wijn_tiktok"
   │   │   │   ├─> post_url: "https://tiktok.com/@pepijn.wijn/video/..."
   │   │   │   └─> date_found: 2025-10-25
   │   │   └─> Insert into MongoDB
   │   └─> If EXISTS: Skip
   └─> Return: Added 1 new wine

6. COMPLETE
   └─> Show summary and success message
```

### **Timeline:**
- Finding videos: ~10 seconds
- Scraping 36 videos: ~15 seconds  
- Wine extraction: ~20 seconds (GPT API calls)
- Database operations: ~1 second
- **Total: ~45 seconds** ⚡

---

## 📊 Data Flow

### **From TikTok to Frontend:**

```
┌──────────────┐
│   TikTok     │  Video: "Rosé van de LIDL?!! 🍷..."
│  @pepijn.wijn│
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Playwright Browser   │  Extract URL: https://tiktok.com/@pepijn.wijn/video/7353...
│ (get_video_urls)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ TikTok oEmbed API    │  GET: https://tiktok.com/oembed?url=...
│                      │  
│ Response:            │  {
│                      │    "title": "Rosé van de LIDL?!!...",
│                      │    "author_name": "pepijn.wijn",
│                      │    "thumbnail_url": "https://..."
│                      │  }
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ OpenAI GPT-4o-mini   │  Prompt: "Extract wine info from Dutch text"
│ (wine_extractor)     │  
│ Response:            │  [
│                      │    {
│                      │      "name": "LIDL rosé",
│                      │      "supermarket": "LIDL",
│                      │      "wine_type": "rose",
│                      │      "rating": "recommended",
│                      │      "description": "..."
│                      │    }
│                      │  ]
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   MongoDB Atlas      │  Insert Document:
│   (winedb)           │  {
│                      │    "_id": ObjectId("..."),
│                      │    "name": "LIDL rosé",
│                      │    "supermarket": "LIDL",
│                      │    "wine_type": "rose",
│                      │    ...
│                      │  }
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   FastAPI Backend    │  GET /api/wines?supermarket=LIDL
│   (localhost:8000)   │  
│   Response:          │  [
│                      │    {
│                      │      "id": "...",
│                      │      "name": "LIDL rosé",
│                      │      "supermarket": "LIDL",
│                      │      ...
│                      │    }
│                      │  ]
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  React Frontend      │  Display Wine Card:
│  (localhost:5173)    │  
│                      │  ┌──────────────────┐
│                      │  │   🍷 LIDL rosé   │
│                      │  │   ─────────────  │
│                      │  │   LIDL | Rosé    │
│                      │  │   Recommended    │
│                      │  │   @pepijn.wijn   │
│                      │  └──────────────────┘
└──────────────────────┘
```

---

## 👤 User Experience Flow

### **For Admin (You):**

```
WEEKLY MAINTENANCE (5 minutes):

1. Find new wine TikTok creators (optional)
   └─> Search: #supermarktwijn, #wijnreview

2. Run automated scraper
   └─> python scripts/auto_scrape_tiktok_profile.py username

3. Check results
   └─> python scripts/check_wines.py
   └─> See: "Total wines: X, Real wines: Y"

4. Done! ✅
```

### **For End Users:**

```
USER VISITS APP:

1. Open: http://localhost:5173/vinly/

2. See Homepage
   ├─> "Ontdek de beste supermarkt wijnen"
   ├─> Filter by Supermarket (6 buttons)
   └─> Filter by Wine Type (4 buttons)

3. Select Filters
   ├─> Click "LIDL"
   └─> Click "Rosé"

4. See Results
   ├─> Wine Card appears:
   │   ├─> Image (TikTok thumbnail)
   │   ├─> Name: "LIDL rosé"
   │   ├─> Supermarket badge: "LIDL"
   │   ├─> Wine type: 🌸 Rosé
   │   ├─> Rating: "Recommended"
   │   ├─> Description: "..."
   │   └─> Source: "@pepijn.wijn"
   └─> Click "Bekijk originele post" → Opens TikTok

5. Browse More Wines
   └─> Change filters, explore other supermarkets
```

---

## 🏗️ Technical Architecture

### **Backend Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Routes  │  │   Services   │  │   Scrapers   │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ health.py    │  │wine_extractor│  │tiktok_oembed │     │
│  │ wines.py     │  │  .py         │  │_scraper.py   │     │
│  │ admin.py     │  │inventory_    │  └──────────────┘     │
│  │ status.py    │  │updater.py    │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Jobs      │  │   Database   │                        │
│  ├──────────────┤  ├──────────────┤                        │
│  │daily_scraper │  │ database.py  │                        │
│  │  .py         │  │ config.py    │                        │
│  └──────────────┘  │ models.py    │                        │
│                     └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   MongoDB    │
                  │    Atlas     │
                  └──────────────┘
```

### **Frontend Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │                 Pages                         │           │
│  │  ┌──────────┐         ┌──────────┐          │           │
│  │  │ Home.jsx │         │About.jsx │          │           │
│  │  └──────────┘         └──────────┘          │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │              Components                       │           │
│  │  ┌────────────────┐  ┌────────────────┐     │           │
│  │  │ Header.jsx     │  │WineCard.jsx    │     │           │
│  │  │ Footer.jsx     │  │WineGrid.jsx    │     │           │
│  │  │Supermarket     │  │WineTypeFilter  │     │           │
│  │  │Selector.jsx    │  │  .jsx          │     │           │
│  │  └────────────────┘  └────────────────┘     │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │              Services                         │           │
│  │  ┌──────────────────────────────────┐        │           │
│  │  │ api.js                           │        │           │
│  │  │  - fetchWines()                  │        │           │
│  │  │  - fetchSupermarkets()           │        │           │
│  │  └──────────────────────────────────┘        │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Responsibilities

### **Backend Scripts:**

| File | Purpose | When to Use |
|------|---------|-------------|
| `auto_scrape_tiktok_profile.py` | **🌟 MAIN SCRIPT** - Fully automated | Run weekly to add wines |
| `get_tiktok_video_urls.py` | Get video URLs only | When you want just URLs |
| `seed_tiktok_influencers.py` | Old manual method | Not needed anymore |
| `add_tiktok_wines.py` | Process pre-defined URLs | Not needed anymore |
| `check_wines.py` | Check database contents | Anytime to see wine count |
| `test_tiktok_oembed_wines.py` | Test extraction on sample | Development/testing |
| `monitor_scraping.py` | Real-time scraping monitor | Watch scraping live |

### **Backend App Files:**

| File | Purpose |
|------|---------|
| `app/scrapers/tiktok_oembed_scraper.py` | TikTok oEmbed API wrapper |
| `app/services/wine_extractor.py` | GPT-4o-mini wine extraction |
| `app/services/inventory_updater.py` | Mark old wines as stale |
| `app/jobs/daily_scraper.py` | Scheduled scraping job (not used yet) |
| `app/api/wines.py` | GET /api/wines endpoint |
| `app/api/admin.py` | POST /api/admin/trigger-scrape |
| `app/api/status.py` | GET /api/status monitoring |
| `app/api/health.py` | GET /health check |

### **Frontend Files:**

| File | Purpose |
|------|---------|
| `src/pages/Home.jsx` | Main wine browser page |
| `src/pages/About.jsx` | About/info page |
| `src/components/SupermarketSelector.jsx` | 6 supermarket filter buttons |
| `src/components/WineTypeFilter.jsx` | 4 wine type filters |
| `src/components/WineCard.jsx` | Individual wine display |
| `src/components/WineGrid.jsx` | Grid layout for wines |
| `src/services/api.js` | API calls to backend |

---

## 🔄 Complete Workflow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     WEEKLY WINE UPDATE                          │
└────────────────────────────────────────────────────────────────┘

                    YOU (Admin)
                         │
                         ▼
        ┌────────────────────────────────┐
        │ Run: python scripts/           │
        │ auto_scrape_tiktok_profile.py  │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   Playwright       │  Find 36 video URLs
        │   (Headless        │  from @pepijn.wijn
        │    Browser)        │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  TikTok oEmbed API │  Get descriptions
        │  (36 API calls)    │  for each video
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  OpenAI GPT-4o-mini│  Extract wine data
        │  (36 API calls)    │  from descriptions
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   MongoDB Atlas    │  Save 2 new wines
        │   (Insert docs)    │  to database
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   FastAPI Backend  │  Serve wines via
        │   (GET /api/wines) │  REST API
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  React Frontend    │  Display wines
        │  (Wine cards)      │  to users
        └────────────────────┘
                 │
                 ▼
               USERS
```

---

## ⚙️ Configuration Flow

### **Environment Variables (.env):**

```
MONGODB_URI
    └─> Used by: database.py
        └─> Connects to: MongoDB Atlas
            └─> Stores: Wine documents

OPENAI_API_KEY
    └─> Used by: wine_extractor.py
        └─> Calls: GPT-4o-mini API
            └─> Returns: Structured wine data

CORS_ORIGINS
    └─> Used by: main.py
        └─> Allows: Frontend to call API
            └─> Enables: Cross-origin requests
```

---

## 📈 Data Models

### **Wine Document in MongoDB:**

```javascript
{
  _id: ObjectId("..."),
  name: "GRAND BATEAU - Beychevelle 2023",
  supermarket: "Jumbo",
  wine_type: "red",
  image_url: "https://p19-common-sign-useastred.tiktokcdn-eu.com/...",
  rating: "Highly recommended",
  description: "Uitstekende wijn voor deze prijs...",
  influencer_source: "pepijn.wijn_tiktok",
  post_url: "https://www.tiktok.com/@pepijn.wijn/video/7558083982248791328",
  date_found: ISODate("2025-10-25T15:30:00Z"),
  in_stock: null,
  last_checked: null
}
```

### **API Response:**

```javascript
GET /api/wines?supermarket=Jumbo&type=red

Response:
[
  {
    "id": "...",
    "name": "GRAND BATEAU - Beychevelle 2023",
    "supermarket": "Jumbo",
    "wine_type": "red",
    "image_url": "https://...",
    "rating": "Highly recommended",
    "influencer_source": "pepijn.wijn_tiktok",
    "post_url": "https://tiktok.com/@pepijn.wijn/video/...",
    "date_found": "2025-10-25T15:30:00Z",
    "in_stock": null,
    "description": "Uitstekende wijn..."
  }
]
```

---

## 🎯 Summary

### **Current State:**
- ✅ **Automated scraping** - One command gets all wines
- ✅ **TikTok integration** - Uses reliable oEmbed API
- ✅ **AI extraction** - GPT-4o-mini finds wine data
- ✅ **Database** - MongoDB stores everything
- ✅ **API** - FastAPI serves wines
- ✅ **Frontend** - React displays beautifully

### **Weekly Process:**
```bash
# That's it! Just one command:
python scripts/auto_scrape_tiktok_profile.py pepijn.wijn

# Check results:
python scripts/check_wines.py

# View in browser:
http://localhost:5173/vinly/
```

### **Time Investment:**
- **Setup:** ✅ Done (one-time)
- **Weekly maintenance:** 5 minutes
- **Adding new creator:** 30 seconds

---

**The system is fully automated, reliable, and ready to scale!** 🚀

