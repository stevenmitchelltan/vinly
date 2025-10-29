# Testing Guide - Admin Panel & Duplicate Detection

## Prerequisites

Make sure you have:
- ✅ Docker running (`docker-compose up`)
- ✅ Frontend accessible at `http://localhost/`
- ✅ Backend accessible at `http://localhost:8000`
- ✅ MongoDB with existing wines

---

## 🧪 Test Suite

### **Test 1: Access Admin Panel**

**Goal:** Verify the admin panel is accessible and login works

```bash
# 1. Open browser
http://localhost/admin

# Expected:
- Login screen appears
- Password field is visible
- Default password hint shows "admin"

# 2. Login with password: admin
# Expected:
- Successfully logged in
- See wine list table
- See "Add TikTok Post" section
- See search bar
```

**✅ Pass Criteria:**
- Login screen loads
- "admin" password works
- Wine list displays with data

---

### **Test 2: Search & Filter Wines**

**Goal:** Verify search functionality

```bash
# 1. In search bar, type: "Chardonnay"
# Expected:
- Table filters to show only Chardonnay wines
- Results update in real-time

# 2. Clear search
# Expected:
- All wines show again

# 3. Try: "Albert Heijn"
# Expected:
- Shows wines from Albert Heijn
```

**✅ Pass Criteria:**
- Search works for wine names
- Search works for supermarket names
- Results filter correctly

---

### **Test 3: Edit Wine Details (Safe Edits)**

**Goal:** Verify all fields can be edited safely

```bash
# 1. Click "Edit" on any wine
# Expected:
- Modal opens with wine details
- All fields populated
- Images show as thumbnails

# 2. Edit the name
Before: "Chardonnay"
After: "Chardonnay Reserve 2021"

# 3. Click "Save Changes"
# Expected:
- Success message
- Modal closes
- Table updates with new name

# 4. Click "Edit" on same wine again
# Expected:
- Shows new name
- post_url unchanged
- No duplicate created
```

**✅ Pass Criteria:**
- Edit modal opens
- Name field editable
- Changes save successfully
- No duplicate in table

---

### **Test 4: Edit Supermarket (Safe Edit)**

**Goal:** Verify supermarket changes don't create duplicates

```bash
# 1. Edit a wine
# 2. Change supermarket from "Albert Heijn" to "Dirk"
# 3. Save
# Expected:
- Saves successfully
- No duplicate created
- Wine still shows once in table

# 4. Verify in backend
```

Run this to check database:
```bash
docker-compose exec backend python -c "
from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.mongodb_uri)
db = client.vinly

# Count total wines
print(f'Total wines: {db.wines.count_documents({})}')

# Check for duplicates by name
from collections import Counter
names = [w['name'] for w in db.wines.find()]
dupes = {k:v for k,v in Counter(names).items() if v > 1}
print(f'Duplicate names: {dupes}')
"
```

**✅ Pass Criteria:**
- Supermarket changes successfully
- No duplicates in database
- Wine count unchanged

---

### **Test 5: Image Management**

**Goal:** Test adding, removing, and reordering images

```bash
# 1. Edit a wine
# Expected:
- See current images as thumbnails
- Each has × remove button
- See "Add image URL" input

# 2. Remove an image
- Click × on second image
- Expected: Image removed from list

# 3. Add new image URL
Example: https://res.cloudinary.com/demo/image/upload/sample.jpg
- Paste URL
- Click "Add"
- Expected: Image appears in list

# 4. Drag to reorder
- Drag first image to last position
- Expected: Order changes
- Numbers update (1, 2, 3...)

# 5. Save
# Expected:
- Changes persist
- Carousel on main page reflects new order
```

**✅ Pass Criteria:**
- Images display correctly
- Remove works
- Add works
- Drag-to-reorder works
- Changes persist after save

---

### **Test 6: Delete Wine**

**Goal:** Verify wine deletion works

```bash
# 1. Note current wine count in table
# 2. Edit a wine
# 3. Click "Delete Wine" button
# Expected:
- Confirmation dialog appears
- "Are you sure..." message

# 4. Click "Cancel"
# Expected:
- Wine not deleted
- Modal still open

# 5. Click "Delete Wine" again → Confirm
# Expected:
- Wine deleted
- Modal closes
- Wine removed from table
- Wine count decreased by 1
```

**✅ Pass Criteria:**
- Confirmation dialog works
- Cancel prevents deletion
- Confirm deletes wine
- Table updates

---

### **Test 7: Add TikTok Post (Web)**

**Goal:** Test adding a wine from TikTok URL

```bash
# 1. Get a TikTok wine video URL
Example: https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329

# 2. Paste into "Add TikTok Post" field
# 3. Click "Add Post"
# Expected:
- "Processing..." message appears
- Takes 30-60 seconds
- Progress indicator shows

# 4. Wait for completion
# Expected:
- Success message: "Successfully added X wine(s)"
- Lists wine names added
- Table refreshes with new wine

# 5. Try adding same URL again
# Expected:
- Message: "Wine already exists from this video"
- Or: "Wines were already in the database"
- No duplicate created
```

**✅ Pass Criteria:**
- URL processing works
- Wine added successfully
- Images extracted and uploaded
- Duplicate detection prevents re-adding

---

### **Test 8: Duplicate Detection (post_url only)**

**Goal:** Verify post_url is the only identifier

```bash
# Test A: Same URL = Duplicate
# 1. Add a TikTok post
# 2. Try adding same URL again
# Expected: Skipped as duplicate

# Test B: Edit name doesn't create duplicate
# 1. Add a wine from URL
# 2. Edit its name in admin panel
# 3. Try adding same URL again
# Expected: Still skipped (post_url is identifier, not name)

# Test C: Different URLs = Different wines
# 1. Add wine from URL_1
# 2. Add same wine name from URL_2
# Expected: Both added (different videos = different entries)
```

**Verify in database:**
```bash
docker-compose exec backend python -c "
from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.mongodb_uri)
db = client.vinly

# Check for duplicate post_urls
from collections import Counter
urls = [w['post_url'] for w in db.wines.find()]
dupes = {k:v for k,v in Counter(urls).items() if v > 1}

print(f'Total wines: {len(urls)}')
print(f'Unique URLs: {len(set(urls))}')
print(f'Duplicate post_urls: {dupes if dupes else \"None (correct!)\"}')
"
```

**✅ Pass Criteria:**
- Same post_url = duplicate detected
- Name changes don't affect duplicate detection
- No wines have duplicate post_url
- Different URLs allow same wine name

---

### **Test 9: CLI Script**

**Goal:** Test command-line wine addition

```bash
# 1. Add a wine via CLI
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@pepijn.wijn/video/7234567890123456789"

# Expected output:
# - "Fetching video metadata..."
# - "Downloading video..."
# - "Transcribing audio..."
# - "Found X wine(s)"
# - "Processing wine 1/X: <wine_name>"
# - "Extracting frames..."
# - "Uploading to Cloudinary..."
# - "Added to database!"

# 2. Try same URL again
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@pepijn.wijn/video/7234567890123456789"

# Expected:
# - "Already in database, skipping"

# 3. Batch processing
echo "https://www.tiktok.com/@user/video/111" > urls.txt
echo "https://www.tiktok.com/@user/video/222" >> urls.txt

docker-compose exec backend python scripts/add_manual_post.py --file urls.txt

# Expected:
# - Processes both URLs
# - Summary shows wines added
```

**✅ Pass Criteria:**
- CLI successfully adds wines
- Progress messages clear
- Duplicate detection works
- Batch mode works

---

### **Test 10: Export & Deploy**

**Goal:** Verify changes sync to GitHub Pages

```bash
# 1. Make an edit in admin panel
# 2. Export to JSON
docker-compose exec backend python scripts/export_to_json.py

# Expected:
# - "Exported X wines to /docs/wines.json"
# - File size displayed

# 3. Check git diff
git diff docs/wines.json

# Expected:
# - Shows your changes
# - New/updated wine data

# 4. Commit and check
git add docs/wines.json
git status

# Expected:
# - Shows modified: docs/wines.json
```

**✅ Pass Criteria:**
- Export creates/updates wines.json
- Git shows correct changes
- File is in docs/ folder

---

## 🔍 Advanced Tests

### **Test 11: Multiple Browser Tabs**

```bash
# 1. Open admin in two browser tabs
# 2. Edit same wine in both
# 3. Save in tab 1
# 4. Save in tab 2
# Expected:
# - Second save overwrites first (last write wins)
# - No errors
```

### **Test 12: Invalid Data**

```bash
# 1. Try adding invalid TikTok URL
http://example.com/not-tiktok

# Expected:
# - Error message displayed
# - No crash

# 2. Try empty image URL
# - Click "Add" with empty field
# Expected:
# - Nothing happens (validation)

# 3. Try saving wine with empty name
# Expected:
# - Validation error
# - "Name is required"
```

### **Test 13: Performance**

```bash
# 1. Load admin with 100+ wines
# Expected:
# - Loads within 2 seconds
# - Table scrolls smoothly
# - Search is responsive

# 2. Add large TikTok video
# Expected:
# - Processing completes within 2 minutes
# - No timeout errors
```

---

## 🐛 Common Issues & Solutions

### **Issue: "Login failed" or 401 error**
```bash
# Solution: Check admin password
docker-compose logs backend | grep -i admin

# Set correct password in .env
ADMIN_PASSWORD=admin

# Restart backend
docker-compose restart backend
```

### **Issue: "Wine not showing after add"**
```bash
# Solution: Refresh the wine list
Click "Refresh" button in admin panel

# Or check backend logs
docker-compose logs backend --tail=50
```

### **Issue: "Images not loading"**
```bash
# Solution: Check Cloudinary credentials
docker-compose logs backend | grep -i cloudinary

# Verify URL format
URLs should start with: https://res.cloudinary.com/
```

### **Issue: "Duplicate still created"**
```bash
# Solution: Check post_url field
docker-compose exec backend python -c "
from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.mongodb_uri)
db = client.vinly

wine = db.wines.find_one()
print('Sample wine:', wine)
print('Has post_url?', 'post_url' in wine)
"

# If post_url missing, wine was added with old system
# Re-add or manually update
```

---

## ✅ Final Checklist

After all tests, verify:

- [ ] Admin panel accessible
- [ ] Login works
- [ ] Wine list displays
- [ ] Search/filter works
- [ ] Edit wine name (no duplicate)
- [ ] Edit supermarket (no duplicate)
- [ ] Edit description/rating
- [ ] Add/remove/reorder images
- [ ] Delete wine works
- [ ] Add TikTok post (web)
- [ ] Add TikTok post (CLI)
- [ ] Duplicate detection works
- [ ] Export to JSON works
- [ ] No duplicate post_urls in database

---

## 📊 Quick Database Inspection

**View all wines:**
```bash
docker-compose exec backend python scripts/check_wines.py
```

**Count by post_url:**
```bash
docker-compose exec backend python -c "
from pymongo import MongoClient
from app.config import settings
from collections import Counter

client = MongoClient(settings.mongodb_uri)
db = client.vinly

urls = [w.get('post_url', 'NO_URL') for w in db.wines.find()]
counts = Counter(urls)

print(f'\nTotal wines: {len(urls)}')
print(f'Unique URLs: {len(set(urls))}')
print(f'\nDuplicates (BAD if any):')
for url, count in counts.items():
    if count > 1:
        print(f'  {url}: {count} times')

if all(c == 1 for c in counts.values()):
    print('✅ No duplicates! All wines have unique post_urls')
"
```

---

## 🎯 Success Metrics

Your system is working correctly if:

1. ✅ **No duplicate post_urls** in database
2. ✅ **All field edits work** without creating duplicates
3. ✅ **Same URL twice** = skipped as duplicate
4. ✅ **CLI and web** both add wines successfully
5. ✅ **Export produces** updated wines.json

---

**Ready to test?** Start with Test 1 and work through the list! 🚀

