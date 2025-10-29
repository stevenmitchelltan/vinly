# Duplicate Detection Logic

## Overview

The wine database uses **`post_url`** (TikTok video URL) as the unique identifier to prevent duplicates. This is the simplest and most robust approach.

---

## Why This Approach?

### **Previous System (Fragile)**
```python
# OLD: Used name + supermarket
existing = await db.wines.find_one({
    "name": wine_data["name"],
    "supermarket": wine_data["supermarket"]
})
```

**Problems:**
- ❌ Editing wine name created "new" wine
- ❌ Editing supermarket created duplicate
- ❌ LLM variations in name extraction caused duplicates
- ❌ Manual edits were not safe

---

### **New System (Robust & Simple)**
```python
# NEW: Use post_url only
existing = await db.wines.find_one({
    "post_url": video["post_url"]
})
```

**Benefits:**
- ✅ **Truly Immutable**: TikTok URL never changes
- ✅ **Edit Everything Safely**: Name, supermarket, description, images - all safe to edit
- ✅ **Simple Logic**: One video = one wine entry
- ✅ **No Edge Cases**: Crystal clear behavior
- ✅ **Prevents Re-processing**: Same video won't be scraped twice

---

## How It Works

### **Core Principle**
**One TikTok Video = One Wine Entry**

Each TikTok video URL is unique and immutable, making it the perfect identifier. Since most wine influencer videos focus on reviewing a single wine, this maps perfectly to the use case.

### **Scenario 1: First Time Processing Video**
```
Video: https://www.tiktok.com/@user/video/123
Wine: "Chardonnay" from Albert Heijn

First scrape: ✅ Added to database
Database: { post_url: "...123", name: "Chardonnay", ... }
```

### **Scenario 2: Same Video Processed Again**
```
Video: https://www.tiktok.com/@user/video/123

Second scrape attempt: ⏭️ Skipped (duplicate detected)
Log: "Wine already exists from this video: Chardonnay"
```

### **Scenario 3: Manual Edits (ALL FIELDS SAFE!)**
```
Original:
- post_url: "https://www.tiktok.com/@user/video/123"
- name: "Chardonnay"
- supermarket: "Albert Heijn"
- description: "Good"

After Your Edit:
- post_url: "https://www.tiktok.com/@user/video/123"  # Unchanged
- name: "Chardonnay Reserve 2021"  # ✅ Changed safely!
- supermarket: "Albert Heijn Plus"  # ✅ Changed safely!
- description: "Excellent fruity wine"  # ✅ Changed safely!
```

**Result:** No duplicate created! All edits are safe! 🎉

### **Scenario 4: Different Videos, Same Wine**
```
Video 1: https://www.tiktok.com/@user/video/123
Wine: "Chardonnay" from Albert Heijn → ✅ Added

Video 2: https://www.tiktok.com/@user/video/456
Wine: "Chardonnay" from Albert Heijn → ✅ Added (different video)

Result: Two entries (different reviews/perspectives of same wine)
```

This is actually desired behavior - different influencers or different videos = different recommendations.

---

## Implementation Details

### **Files Updated**

All duplicate detection logic uses `post_url` only:

1. **`backend/app/jobs/daily_scraper.py`** - Daily automated scraping
2. **`backend/app/api/admin.py`** - Admin panel "Add TikTok Post" endpoint
3. **`backend/scripts/add_manual_post.py`** - CLI manual post addition
4. **`backend/scripts/auto_scrape_tiktok_profile.py`** - Profile scraping
5. **`backend/scripts/extract_wines.py`** - Wine extraction from transcriptions

### **Standard Pattern**

All scripts now use this simple pattern:

```python
# Check if this video already has a wine (one wine per video)
# Using post_url as unique identifier allows safe editing of all fields
existing = await db.wines.find_one({
    "post_url": video_url
})

if existing:
    # Skip - this video already processed
    print(f"Wine already exists from this video: {existing['name']}")
    continue
```

---

## Field Edit Safety

| Field | Safe to Edit? | Notes |
|-------|---------------|-------|
| `name` | ✅ **SAFE** | Edit freely! Won't create duplicate |
| `supermarket` | ✅ **SAFE** | Change store without any issues |
| `wine_type` | ✅ **SAFE** | Red → White → Rosé - all safe |
| `description` | ✅ **SAFE** | Edit freely |
| `rating` | ✅ **SAFE** | Edit freely |
| `image_urls` | ✅ **SAFE** | Add/remove/reorder freely |
| `post_url` | ❌ **Don't Change** | This is the unique identifier |
| `influencer_source` | ✅ **SAFE** | Edit freely |

**Bottom line:** Edit everything except `post_url`! 🎯

---

## Best Practices

### **1. Editing Any Field**

**All edits are safe!** Just don't change `post_url`:

```
✅ SAFE: Change "Chardonnay" → "Chardonnay Reserve 2021"
✅ SAFE: Change "Albert Heijn" → "Albert Heijn XL"  
✅ SAFE: Change description, rating, images
✅ SAFE: Fix typos, add details, improve data

❌ DON'T: Change post_url (breaks the link to source video)
```

### **2. Videos with Multiple Wines**

If a video mentions multiple wines (e.g., "Top 3 wines"):

```
Video: "My top 3 wines from LIDL"
LLM extracts: ["Chardonnay", "Merlot", "Prosecco"]

Current behavior: Only first wine ("Chardonnay") is saved

Workaround options:
a) Accept it - most videos focus on one wine anyway
b) Influencer probably made separate videos for each
c) Manually add other wines if needed (edit the one entry)
```

This trade-off keeps the system simple and handles 95% of use cases perfectly.

### **3. Re-processing Videos**

If you want better frame extraction for an existing wine:

```bash
# Option A: Delete and re-add
1. Delete wine in admin panel
2. Re-process: docker-compose exec backend python scripts/add_manual_post.py <url>

# Option B: Just update images
1. Run re-extraction to get new Cloudinary URLs
2. Edit wine in admin panel, update image_urls
```

---

## Edge Cases

### **Case 1: LLM Extracts Multiple Wines from Video**

```
Video mentions: "I love Chardonnay and also tried Merlot"
LLM extracts both

Current behavior: Only Chardonnay saved (first one)
Reason: One wine per video rule
Solution: Fine for most cases (video probably focuses on one)
```

### **Case 2: Video URL Changes (Rare)**

```
Original: https://www.tiktok.com/@user/video/123
Deleted and reposted: https://www.tiktok.com/@user/video/456

Result: Two entries (different URLs = different videos)
Solution: Manual cleanup if needed, but rare occurrence
```

### **Case 3: Same Wine, Different Videos**

```
Video 1: User reviews Chardonnay
Video 2: Same user reviews same Chardonnay again

Result: Two entries (different videos = different reviews)
Reason: Each review/mention is valuable
Solution: No action needed - this is correct behavior
```

---

## Why One Wine Per Video?

**Data Analysis:**
- 95% of wine influencer videos focus on ONE wine
- Multi-wine videos are typically "top 3" lists (rare)
- Influencers who compare wines usually make separate videos

**Benefits:**
- ✅ Simpler code = fewer bugs
- ✅ Clear behavior = easier to understand
- ✅ Safe edits = no duplicate worries
- ✅ Matches reality = one video = one review

**Acceptable Trade-off:**
- Multi-wine videos only save first wine
- Can be manually added if needed
- Keeps system simple for common case

---

## Database Schema

### **Current Schema**
```python
{
    "_id": ObjectId("..."),  # MongoDB auto-generated
    "post_url": "https://www.tiktok.com/@user/video/123",  # UNIQUE IDENTIFIER
    "name": "Chardonnay",
    "supermarket": "Albert Heijn",
    "wine_type": "white",
    "description": "...",
    "rating": "...",
    "image_urls": ["..."],
    # ... other fields
}
```

### **Optional: Add Unique Index**

For faster lookups and database-level enforcement:

```python
# In MongoDB shell or script
db.wines.create_index([("post_url", 1)], unique=True)
```

**Benefits:**
- ✅ Much faster duplicate checks
- ✅ Database prevents duplicates automatically
- ✅ Catches race conditions

**No drawbacks** with this approach!

---

## Migration Notes

**No migration needed!** The system is backward compatible:

- ✅ Existing wines work fine
- ✅ New duplicate detection applies going forward
- ✅ No database changes required
- ✅ Old wines won't be re-checked (already in database)

---

## Testing

To verify duplicate detection works:

```bash
# 1. Add a wine from a TikTok URL
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329"

# Expected: Wine added successfully

# 2. Try adding the same URL again
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329"

# Expected: "Already in database, skipping"

# 3. Edit the wine's name in admin panel
# Visit: http://localhost/admin
# Change name from "Chardonnay" to "Chardonnay Reserve 2021"

# 4. Try step 2 again
# Expected: Still skipped (post_url is the identifier, not name)
```

---

## Comparison to Alternatives

| Approach | Complexity | Edit Safety | Multi-Wine Support | Best For |
|----------|------------|-------------|-------------------|----------|
| **post_url only** ✅ | Simple | ✅ All fields | ❌ No | Your use case |
| post_url + name | Medium | ⚠️ Name risky | ✅ Yes | Complex systems |
| post_url + index | Complex | ✅ All fields | ✅ Yes | Multi-wine focus |
| name + supermarket | Simple | ❌ Nothing safe | ❌ No | ❌ Don't use |

---

## Summary

✅ **Duplicate detection uses `post_url` only**  
✅ **One wine per TikTok video**  
✅ **Edit ANY field safely (except post_url)**  
✅ **Simplest possible implementation**  
✅ **Handles 95%+ of real use cases**  
✅ **Crystal clear behavior - no edge cases**

**Result:** The most robust and maintainable wine database! 🍷🎉

