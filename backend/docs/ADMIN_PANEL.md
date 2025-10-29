# Wine Admin Panel Documentation

## Overview

The Wine Admin Panel provides a web-based interface and CLI tools for managing wine data, correcting LLM extraction errors, and adding missed TikTok posts.

## Features

### 1. Edit Wine Data
- **Name**: Correct wine names
- **Supermarket**: Change supermarket assignment
- **Wine Type**: Update wine type (red, white, rosé, sparkling)
- **Rating/Quote**: Edit influencer quotes
- **Description**: Modify wine descriptions
- **Influencer Source**: Update source attribution

### 2. Manage Images
- **View**: See all images for a wine in the carousel
- **Add**: Paste Cloudinary URLs to add new images
- **Remove**: Click × to remove unwanted images
- **Reorder**: Drag and drop images to change their order

### 3. Add TikTok Posts
- **Web Interface**: Paste a TikTok URL and click "Add Post"
- **CLI**: Use the command-line script for batch processing
- **Auto-Processing**: Automatically downloads, transcribes, extracts wines, and uploads frames

### 4. Delete Wines
- Remove wines that were incorrectly extracted or are duplicates

---

## Access

### Web Interface

1. **Development**: Navigate to `http://localhost:5173/admin`
2. **Login**: Default password is `admin` (configurable via `ADMIN_PASSWORD` env variable)
3. **Manage**: Browse, search, edit, and delete wines

### CLI

```bash
# Single URL
docker-compose exec backend python scripts/add_manual_post.py <tiktok-url>

# Multiple URLs
docker-compose exec backend python scripts/add_manual_post.py <url1> <url2> <url3>

# Batch from file
docker-compose exec backend python scripts/add_manual_post.py --file urls.txt
```

---

## Usage Guide

### Editing a Wine

1. Go to `/admin` and log in
2. Use the search bar to find the wine
3. Click "Edit" on the wine row
4. Make your changes in the modal
5. Click "Save Changes"

### Managing Images

**To Reorder:**
1. In the edit modal, drag image thumbnails to reorder
2. The first image is the primary image shown in the carousel

**To Add:**
1. Copy a Cloudinary URL (e.g., from a re-extraction)
2. Paste in the "Add image URL" field
3. Click "Add"

**To Remove:**
1. Hover over an image thumbnail
2. Click the × button in the top-right

### Adding a Missed TikTok Post

**Via Web:**
1. Copy the TikTok video URL
2. Paste into "Add TikTok Post" field
3. Click "Add Post"
4. Wait 30-60 seconds for processing
5. New wines will appear in the list

**Via CLI:**
```bash
# Single post
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@pepijn.wijn/video/7564708325217111329"

# Multiple posts
docker-compose exec backend python scripts/add_manual_post.py \
  "https://www.tiktok.com/@user/video/123" \
  "https://www.tiktok.com/@user/video/456"

# Batch from file
echo "https://www.tiktok.com/@user/video/123" > urls.txt
echo "https://www.tiktok.com/@user/video/456" >> urls.txt
docker-compose exec backend python scripts/add_manual_post.py --file urls.txt
```

### Deleting a Wine

1. Click "Edit" on the wine
2. Click "Delete Wine" at the bottom
3. Confirm the deletion

⚠️ **Warning**: Deletion is permanent and cannot be undone!

---

## Deploying Changes to GitHub Pages

After making changes via the admin panel, you need to manually export and deploy:

### Step 1: Export to JSON

```bash
docker-compose exec backend python scripts/export_to_json.py
```

This reads from MongoDB and writes to `docs/wines.json`.

### Step 2: Commit and Push

```bash
git add docs/wines.json
git commit -m "Update wine data via admin panel"
git push origin main
```

### Step 3: Wait for Deployment

GitHub Actions will automatically build and deploy (3-5 minutes).

---

## Security

### Authentication

- **Password Protection**: Admin endpoints require a Bearer token
- **Default Password**: `admin` (change via `ADMIN_PASSWORD` environment variable)
- **Token Storage**: Stored in localStorage (client-side)

### Changing the Password

1. Add to your `.env` file:
```
ADMIN_PASSWORD=your-secure-password
```

2. Restart the backend:
```bash
docker-compose restart backend
```

3. Log in with the new password

---

## Technical Details

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/wines` | GET | List all wines |
| `/api/admin/wines/{id}` | PUT | Update wine |
| `/api/admin/wines/{id}` | DELETE | Delete wine |
| `/api/admin/add-tiktok-post` | POST | Process TikTok URL |

### Authentication Header

```
Authorization: Bearer <admin_password>
```

### CLI Script Features

- **Signal Word Detection**: Uses enhanced frame extraction
- **Automatic Transcription**: Whisper API for audio
- **Cloudinary Upload**: Frames uploaded automatically
- **Duplicate Detection**: Skips wines already in database
- **Progress Logging**: Detailed console output

---

## Troubleshooting

### "Invalid credentials" Error

- Check that `ADMIN_PASSWORD` matches in `.env` and your login
- Clear localStorage and log in again
- Restart backend after changing password

### "Failed to add TikTok post" Error

- Verify the URL is a valid TikTok video link
- Check that OpenAI API key is configured
- Ensure Cloudinary credentials are set
- Check backend logs: `docker-compose logs backend`

### Images Not Loading

- Verify Cloudinary URLs are correct
- Check that images haven't been deleted from Cloudinary
- Ensure URLs start with `https://res.cloudinary.com/`

### Changes Not Showing on GitHub Pages

- Did you run `export_to_json.py`?
- Did you commit and push `docs/wines.json`?
- Wait 5-10 minutes for CDN cache to clear
- Hard refresh your browser (Ctrl+Shift+R)

---

## Examples

### Correcting a Wine Name

**Before**: "Chardonnay 2021"
**After**: "Chardonnay Reserve 2021"

1. Search for "Chardonnay 2021"
2. Click Edit
3. Update name field
4. Save Changes
5. Export and deploy

### Adding Better Images

If frame extraction missed the bottle:

1. Run re-extraction for that wine:
```bash
docker-compose exec backend python scripts/re_extract_with_signals.py
```

2. Copy new Cloudinary URLs from logs
3. Edit wine in admin panel
4. Add new URLs, remove old ones
5. Save and deploy

### Batch Adding Posts

```bash
# Create a file with URLs
cat > batch_urls.txt << EOF
https://www.tiktok.com/@user/video/123
https://www.tiktok.com/@user/video/456
https://www.tiktok.com/@user/video/789
EOF

# Process all at once
docker-compose exec backend python scripts/add_manual_post.py --file batch_urls.txt
```

---

## Best Practices

1. **Test Changes Locally**: Use the admin panel in development before deploying
2. **Review Before Deleting**: Deletion is permanent
3. **Keep Image URLs**: Don't remove all images; always have at least one
4. **Validate URLs**: Ensure TikTok URLs are complete and valid
5. **Export Regularly**: After multiple edits, export and deploy to keep GitHub Pages in sync
6. **Backup Data**: Periodically export `docs/wines.json` as backup

---

## Future Enhancements

Potential improvements for the admin panel:

- [ ] Bulk edit multiple wines
- [ ] Image upload (instead of just URLs)
- [ ] Manual frame timestamp selection
- [ ] Wine merge/split functionality
- [ ] Activity log/audit trail
- [ ] Role-based access control
- [ ] In-app export to JSON button
- [ ] Preview changes before saving
- [ ] Undo functionality

