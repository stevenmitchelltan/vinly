# Wine Images

Wine images for the Vinly wine discovery application.

## Storage Location

**Production:** Images are hosted on **Cloudinary CDN** for optimal performance and scalability.

- CDN Base URL: `https://res.cloudinary.com/[your-cloud-name]/image/upload/vinly/wines/`
- Storage: 25GB free tier
- Bandwidth: 25GB/month free tier
- Capacity: ~10,000 wine images

## Image Organization

Images are organized by wine ID:
- `wines/[wine_id]_0.jpg` - First image for wine
- `wines/[wine_id]_1.jpg` - Second image for wine
- `wines/[wine_id]_2.jpg` - Third image for wine
- etc.

## Automatic Upload

Images are automatically uploaded to Cloudinary during the weekly GitHub Actions workflow:

1. Frame extraction from TikTok videos
2. Upload to Cloudinary with wine_id
3. CDN URLs saved to wines.json
4. Local files discarded (not committed to repo)

## Local Development

For local development with Docker:
- Images are temporarily stored in `backend/static/wine_images/`
- Not committed to git (in .gitignore)
- Regenerated on each local scrape

## Migration

To migrate existing local images to Cloudinary:

```bash
# Set Cloudinary credentials
export CLOUDINARY_CLOUD_NAME=your-cloud-name
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret

# Run migration script
docker exec vinly-backend python scripts/migrate_images_to_cloudinary.py
```

This will:
- Upload all local images to Cloudinary
- Update database with CDN URLs
- Images can then be deleted locally

## Benefits of Cloudinary

✅ **Fast global CDN** - Images load quickly worldwide  
✅ **Automatic optimization** - Format conversion, compression  
✅ **Scalable** - No git repo bloat  
✅ **Free tier** - Sufficient for thousands of wines  
✅ **Transformations** - On-the-fly resizing, cropping  

## Example Usage

Frontend loads images from Cloudinary URLs stored in wines.json:

```json
{
  "id": "123",
  "name": "Château La Couronne",
  "image_urls": [
    "https://res.cloudinary.com/vinly/image/upload/vinly/wines/123_0.jpg",
    "https://res.cloudinary.com/vinly/image/upload/vinly/wines/123_1.jpg"
  ]
}
```

No local image files needed in production!

