# Rescanning TikTok Profiles for Missed Wines

## Overview

The `find_and_add_missed_wines.py` script rescans TikTok profiles to find and process videos that weren't added to the database yet. This is useful when:

- The LLM prompt was improved (e.g., now accepting rosé wines)
- You want to catch up on new videos from influencers
- Previous scraping runs had errors or missed some videos

## Key Features

✅ **Efficient** - Checks URLs against database BEFORE downloading anything  
✅ **Safe** - Dry-run mode to preview what would be processed  
✅ **Smart** - Uses improved LLM prompt with rosé normalization  
✅ **Complete** - Full pipeline: download → transcribe → extract → frames → upload  
✅ **Duplicate-safe** - Uses `post_url` as unique identifier  

---

## Usage

### 1. Dry Run (Preview Only)

See what NEW videos would be processed without actually doing anything:

```bash
docker-compose exec backend python scripts/find_and_add_missed_wines.py --dry-run
```

**Output:**
```
🍷 FIND AND ADD MISSED WINES
============================================================
⚠️  DRY RUN MODE - No actual processing will occur

📊 Checking database...
  ✓ Found 35 wines already in database

📱 Scanning @pepijn.wijn profile...
  ✓ Found 127 videos on profile

  📊 @pepijn.wijn:
     Total videos found: 127
     Already in database: 35
     NEW videos to process: 92

============================================================
📋 SUMMARY:
   Total profiles scanned: 1
   Total NEW URLs found: 92
============================================================

🔍 NEW URLs that would be processed:
   - https://www.tiktok.com/@pepijn.wijn/video/...
   - https://www.tiktok.com/@pepijn.wijn/video/...
   ...

Run without --dry-run to process these 92 videos
```

---

### 2. Process Specific Profile

Process only one influencer's profile:

```bash
docker-compose exec backend python scripts/find_and_add_missed_wines.py --profile pepijn.wijn
```

---

### 3. Process All Configured Profiles

Process all profiles in the default list:

```bash
docker-compose exec backend python scripts/find_and_add_missed_wines.py
```

**Interactive confirmation:**
```
⚠️  About to process 92 new videos.
   This will download, transcribe, extract, and upload images.
   Continue? (y/N):
```

---

### 4. Limit Number of Videos Scanned

Scan only the most recent N videos per profile:

```bash
docker-compose exec backend python scripts/find_and_add_missed_wines.py --max-videos 50
```

---

## How It Works

### Step 1: Get All Video URLs
```
📱 Scanning @pepijn.wijn profile...
  ✓ Found 127 videos on profile
```
Uses Playwright to scrape the TikTok profile page.

---

### Step 2: Check Database (BEFORE Downloading!)
```
📊 Checking database...
  ✓ Found 35 wines already in database
```
Queries MongoDB for all existing `post_url` values.

---

### Step 3: Filter to NEW URLs Only
```
📊 @pepijn.wijn:
   Total videos found: 127
   Already in database: 35
   NEW videos to process: 92
```
Only processes URLs that aren't in the database yet - **no wasted downloads!**

---

### Step 4: Process Each New Video
```
[1/92]
🎬 Processing: https://www.tiktok.com/@pepijn.wijn/video/...
  ✓ Video by @pepijn.wijn
  🎤 Transcribing...
  🤖 Extracting wine data...
  🔍 Found wine mention at 6.2s using: signal_word
  📸 Extracting 6 frames...
  ☁️  Uploading to Cloudinary...
  ✅ Added: Franse rosé (LIDL)
```

Full pipeline for each video:
1. Download audio + video
2. Transcribe with Whisper
3. Extract wine data with improved LLM
4. Find optimal frames with signal words
5. Upload to Cloudinary
6. Save to MongoDB

---

## Why This is Efficient

### ❌ **Old Approach (Inefficient)**
```
For each video:
  1. Download video (70 MB, 30 seconds)
  2. Transcribe (60 seconds)
  3. Check database
  4. "Oh, already exists!" ← WASTED TIME/BANDWIDTH
```

### ✅ **New Approach (Efficient)**
```
1. Get all profile URLs (5 seconds)
2. Check ALL against database (1 second)
3. Filter to NEW urls only
4. Process ONLY new videos ← NO WASTE!
```

**Time saved:**
- If you have 35 existing wines out of 127 videos
- Old way: 35 × 90 seconds = **52 minutes wasted**
- New way: **0 seconds wasted** ✅

---

## Customizing Profile List

Edit the script to add more profiles:

```python
# In find_and_add_missed_wines.py, line ~240
profiles = [
    "pepijn.wijn",
    "other.wine.influencer",  # Add more here
    "another.profile",
]
```

Or just use `--profile` flag for one-offs.

---

## After Running

Once wines are added, export to GitHub Pages:

```bash
# 1. Export to JSON
docker-compose exec backend python scripts/export_to_json.py

# 2. Commit and push
git add docs/wines.json
git commit -m "Added missed wines from rescanning"
git push
```

---

## Use Cases

### **1. After LLM Improvements**
```bash
# LLM now accepts rosé wines - rescan to catch previously rejected wines
docker-compose exec backend python scripts/find_and_add_missed_wines.py --dry-run
```

### **2. Regular Updates**
```bash
# Weekly: catch up on new videos from influencers
docker-compose exec backend python scripts/find_and_add_missed_wines.py
```

### **3. New Influencer**
```bash
# Process entire history of new influencer
docker-compose exec backend python scripts/find_and_add_missed_wines.py --profile new.influencer --max-videos 200
```

---

## Safety Features

✅ **Duplicate Detection** - Uses `post_url` as unique identifier  
✅ **Dry-run Mode** - Preview before processing  
✅ **Confirmation Prompt** - Asks before bulk processing  
✅ **Error Handling** - Continues on errors, shows summary at end  
✅ **Progress Tracking** - Shows [X/Y] for each video  

---

## Performance

**Typical Speed:**
- Profile scanning: ~5 seconds
- Database check: ~1 second
- Per video processing: ~90 seconds (download + transcribe + extract + upload)

**For 92 new videos:**
- Total time: ~2.3 hours
- Downloads: ~6.4 GB
- API costs: ~$2.30 (Whisper) + $0 (GPT-4o-mini cache hit)

---

## Tips

1. **Always dry-run first** to see what would be processed
2. **Use --max-videos** for initial testing (e.g., `--max-videos 5`)
3. **Run during off-hours** if processing many videos
4. **Check logs** for LLM reasoning if wines aren't extracted

---

## Example Output

```
🍷 FIND AND ADD MISSED WINES
============================================================

📊 Checking database...
  ✓ Found 35 wines already in database

📱 Scanning @pepijn.wijn profile...
  ✓ Found 127 videos on profile

  📊 @pepijn.wijn:
     Total videos found: 127
     Already in database: 35
     NEW videos to process: 92

============================================================
📋 SUMMARY:
   Total profiles scanned: 1
   Total NEW URLs found: 92
============================================================

⚠️  About to process 92 new videos.
   This will download, transcribe, extract, and upload images.
   Continue? (y/N): y

🚀 Processing new videos...

[1/92]
🎬 Processing: https://www.tiktok.com/@pepijn.wijn/video/7353670393489657120
  ✓ Video by @pepijn.wijn
  🎤 Transcribing...
  🤖 Extracting wine data...
  🔍 Found wine mention at 6.2s using: signal_word
  📸 Extracting 6 frames...
  ☁️  Uploading to Cloudinary...
  ✅ Added: Franse rosé (LIDL)

[2/92]
...

============================================================
🎉 COMPLETE!
   Processed: 92 videos
   Added: 87 wines
============================================================

📝 Next steps:
   1. Run: docker-compose exec backend python scripts/export_to_json.py
   2. Commit and push to deploy to GitHub Pages
```

