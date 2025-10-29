# Wine Admin Panel - Implementation Summary

## What Was Built

A complete wine data management system with both web-based and CLI interfaces for correcting LLM extraction errors and managing wine data.

## Files Created

### Backend

1. **`backend/app/models.py`** (Modified)
   - Added `WineUpdateRequest` model for validated updates
   - Added `AddTikTokPostRequest` model for manual post addition

2. **`backend/app/api/admin.py`** (Enhanced)
   - `GET /api/admin/wines` - List all wines with full details
   - `PUT /api/admin/wines/{wine_id}` - Update wine details
   - `DELETE /api/admin/wines/{wine_id}` - Delete a wine
   - `POST /api/admin/add-tiktok-post` - Process TikTok URL and extract wines
   - Simple Bearer token authentication

3. **`backend/app/config.py`** (Modified)
   - Added `admin_password` setting (default: "admin")

4. **`backend/scripts/add_manual_post.py`** (New)
   - CLI tool for adding TikTok posts
   - Supports single URLs, multiple URLs, or batch from file
   - Full video processing: download → transcribe → extract → upload → save
   - Uses signal word detection for optimal frame extraction

5. **`backend/scripts/urls.txt.example`** (New)
   - Example file for batch URL processing

6. **`backend/docs/ADMIN_PANEL.md`** (New)
   - Complete documentation for the admin panel
   - Usage guide, examples, troubleshooting

### Frontend

1. **`frontend/src/services/api.js`** (Modified)
   - Added `adminApi` object with methods:
     - `getAllWines()` - Fetch all wines for admin
     - `updateWine(wineId, updates)` - Update wine
     - `deleteWine(wineId)` - Delete wine
     - `addTikTokPost(tiktokUrl)` - Process TikTok post
     - `setToken(token)` - Store admin token

2. **`frontend/src/components/AdminWineEditor.jsx`** (New)
   - Modal component for editing wines
   - Form with all wine fields
   - Image manager with drag-to-reorder
   - Add/remove images via Cloudinary URLs
   - Delete wine button with confirmation

3. **`frontend/src/pages/Admin.jsx`** (New)
   - Password-protected admin interface
   - Wine list table with search
   - "Add TikTok Post" section
   - Edit modal integration
   - Refresh and export reminders

4. **`frontend/src/App.jsx`** (Modified)
   - Added `/admin` route

### Documentation

1. **`README.md`** (Modified)
   - Added admin panel to features list
   - Added admin panel URL to quick start
   - Added admin panel section to usage guide
   - Link to full documentation

## Key Features

### Web Interface (`/admin`)

✅ **Password Protected** - Simple Bearer token auth  
✅ **Edit Wine Data** - Name, supermarket, type, rating, description  
✅ **Image Management** - Add/remove/reorder Cloudinary URLs  
✅ **Add TikTok Posts** - Paste URL, auto-process and extract  
✅ **Delete Wines** - Remove incorrect entries  
✅ **Search & Filter** - Find wines quickly  
✅ **Real-time Updates** - Changes reflected immediately

### CLI Tool

✅ **Single URL Processing** - `python scripts/add_manual_post.py <url>`  
✅ **Batch Processing** - `--file urls.txt` for multiple posts  
✅ **Signal Word Detection** - Uses enhanced frame extraction  
✅ **Progress Logging** - Detailed console output  
✅ **Duplicate Detection** - Skips existing wines  
✅ **Automatic Upload** - Frames to Cloudinary, data to MongoDB

## How to Use

### Access Admin Panel

1. Navigate to `http://localhost:5173/admin`
2. Log in with password: `admin`
3. Browse, edit, or add wines

### Edit a Wine

1. Search for the wine
2. Click "Edit"
3. Modify fields or manage images
4. Save changes

### Add a Missed Post

**Web:**
```
1. Paste TikTok URL in "Add TikTok Post" field
2. Click "Add Post"
3. Wait 30-60 seconds
4. New wines appear in list
```

**CLI:**
```bash
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@user/video/123"
```

### Deploy Changes

After edits:
```bash
# Export to JSON
docker-compose exec backend python scripts/export_to_json.py

# Commit and push
git add docs/wines.json
git commit -m "Update wine data"
git push origin main
```

## Security

- **Authentication**: Bearer token (configurable via `ADMIN_PASSWORD` env var)
- **Default Password**: `admin` (change in production!)
- **Admin Endpoints**: All require Authorization header
- **Token Storage**: localStorage (client-side)

## Technical Details

### Image Management

Images are stored as Cloudinary URLs in `image_urls` array:
- Drag-and-drop to reorder (first = primary)
- Add new URLs via text input
- Remove with × button
- Validation ensures Cloudinary format

### TikTok Post Processing

Full pipeline:
1. Fetch video metadata (TikTok oEmbed API)
2. Download video (TikTok downloader)
3. Transcribe audio (Whisper)
4. Extract wines (GPT-4o-mini)
5. Find optimal frames (Signal word detection)
6. Extract frames (FFmpeg)
7. Upload images (Cloudinary)
8. Save to database (MongoDB)

### API Architecture

```
Frontend (React)
    ↓ [Authorization: Bearer <token>]
Admin API (FastAPI)
    ↓ [verify_admin_auth()]
MongoDB (Database)
    ↓ [CRUD operations]
Wine Data
```

## What's Next

The admin panel is fully functional and ready to use! Possible future enhancements:

- [ ] Bulk edit multiple wines
- [ ] Image upload (not just URLs)
- [ ] Manual frame timestamp selection
- [ ] Wine merge/split
- [ ] Activity log
- [ ] Role-based access
- [ ] In-app export button
- [ ] Undo functionality

## Testing

To test the admin panel:

1. Start the app: `docker-compose up`
2. Go to `http://localhost:5173/admin`
3. Log in with `admin`
4. Try:
   - Searching for a wine
   - Editing wine details
   - Adding/removing/reordering images
   - Adding a TikTok post (use a real URL)
   - Deleting a test wine

## Troubleshooting

**Can't log in?**
- Check `ADMIN_PASSWORD` in `.env`
- Clear localStorage and try again
- Restart backend

**Changes not saving?**
- Check browser console for errors
- Verify MongoDB is running
- Check backend logs

**TikTok post fails?**
- Verify URL is valid
- Check OpenAI API key
- Ensure Cloudinary credentials are set

## Documentation

Full guide available at: **[backend/docs/ADMIN_PANEL.md](backend/docs/ADMIN_PANEL.md)**

---

**Status**: ✅ Complete and ready to use!

