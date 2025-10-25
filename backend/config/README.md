# 🎛️ Configuration Files

All keywords, settings, and filters are managed through YAML files for easy updates.

## 📁 Configuration Files

### **1. supermarkets.yaml**
Defines all supported supermarkets and their aliases.

**When to edit:**
- Adding a new supermarket
- Adding alias for existing supermarket (e.g., "AH" for Albert Heijn)

**Example:**
```yaml
supermarkets:
  - name: "Albert Heijn"
    aliases:
      - "albert heijn"
      - "ah"
      - "appie"        # ← Add new alias here
```

---

### **2. wine_keywords.yaml**
Defines all wine-related keywords for filtering and detection.

**When to edit:**
- Improving video filtering
- Adding new wine varieties
- Adding Dutch wine terminology

**Sections:**
- `wine_keywords`: Basic wine words (wijn, wijntje)
- `wine_varieties`: Malbec, Chardonnay, etc.
- `recommendation_keywords`: aanrader, top, koopje
- `wine_hashtags`: #wijn, #supermarktwijn
- `negative_keywords`: matig, niet lekker (to skip bad wines)

---

### **3. scraping_settings.yaml**
Defines scraping behavior and optimization settings.

**When to edit:**
- Adjusting performance (scroll speed, timeouts)
- Changing cost optimization settings
- Modifying quality thresholds

**Key settings:**
```yaml
tiktok:
  max_videos_per_profile: 300  # How many videos to fetch
  scroll_timeout_ms: 1500      # Speed of scrolling

extraction:
  min_caption_length: 20       # Skip very short captions

cost_optimization:
  pre_filter_videos: true      # Filter before GPT
  skip_processed_videos: true  # Don't re-process
```

---

## 🔧 How to Update

### **Add a New Supermarket:**

1. Edit `backend/config/supermarkets.yaml`
2. Add to the list:
```yaml
  - name: "Coop"
    aliases:
      - "coop"
      - "coop wijn"
```
3. Restart backend
4. Done! No code changes needed

---

### **Add Wine Keywords:**

1. Edit `backend/config/wine_keywords.yaml`
2. Add to relevant section:
```yaml
wine_varieties:
  - "grenache"  # ← Add new variety
```
3. No restart needed (loaded dynamically)

---

### **Tune Filtering:**

Edit recommendation keywords to be more/less strict:

**More strict** (fewer false positives):
```yaml
recommendation_keywords:
  - "aanrader"
  - "top"
  - "must have"
```

**Less strict** (catch more content):
```yaml
recommendation_keywords:
  - "test"
  - "proberen"
  - "bekijken"
```

---

## 📊 Current Configuration

### **Supermarkets (7):**
1. Albert Heijn (aliases: ah, appie)
2. Jumbo
3. LIDL
4. ALDI
5. HEMA
6. Dirk
7. Plus

### **Total Keywords:**
- Wine keywords: 4
- Wine varieties: 21
- Recommendation keywords: 13
- Supermarket keywords: 22
- Wine hashtags: 8

---

## ✅ Benefits of YAML Config

**Before (hardcoded in .py):**
```python
SUPERMARKETS = ["Albert Heijn", "Dirk", ...]  # Hard to find
wine_keywords = ['wijn', 'wijntje']           # Scattered across files
```

**After (YAML):**
```yaml
# All in one place!
supermarkets:
  - name: "Albert Heijn"
    aliases: ["ah", "appie"]
```

**Advantages:**
- ✅ Easy to update (no code knowledge needed)
- ✅ All configuration in one place
- ✅ Can be edited without code changes
- ✅ Clear structure and documentation
- ✅ No need to restart for most changes

---

## 🎯 Common Tasks

### **Add Supermarket Alias:**
```yaml
# supermarkets.yaml
  - name: "Albert Heijn"
    aliases:
      - "ah"
      - "appie"
      - "ah wijn"
      - "albertheijn"  # ← Add this
```

### **Add Wine Variety:**
```yaml
# wine_keywords.yaml
wine_varieties:
  - "malbec"
  - "chardonnay"
  - "grüner veltliner"  # ← Add this
```

### **Adjust Quality Filter:**
```yaml
# scraping_settings.yaml
quality:
  minimum_rating_score: 7  # Change from 6 to 7 for higher quality
```

---

## 🧪 Testing Configuration Changes

After editing YAML files:

```bash
# Test that configuration loads
python -c "from app.utils.config_loader import config; print(config.get_supermarket_list())"

# Test filtering with new keywords
python scripts/test_improved_filtering.py
```

---

## 📚 Files That Use These Configs

### **supermarkets.yaml** used by:
- `app/services/wine_extractor.py` - Wine extraction
- `app/models.py` - Data models
- `app/api/wines.py` - API endpoints
- `scripts/smart_scraper.py` - Filtering

### **wine_keywords.yaml** used by:
- `scripts/smart_scraper.py` - Pre-filtering
- `app/services/wine_extractor.py` - Wine types

### **scraping_settings.yaml** used by:
- `scripts/smart_scraper.py` - Scroll settings
- `app/services/wine_extractor.py` - GPT settings

---

## 💡 Pro Tips

1. **Test after changes:**
   ```bash
   python scripts/test_improved_filtering.py
   ```

2. **Version control:**
   YAML files are tracked in git, so changes are versioned

3. **Add comments:**
   ```yaml
   aliases:
     - "ah"      # Most common abbreviation
     - "appie"   # Colloquial Dutch term
   ```

4. **Keep it simple:**
   Don't add too many keywords - quality over quantity

---

**All system behavior is now controlled through YAML!** 🎛️

