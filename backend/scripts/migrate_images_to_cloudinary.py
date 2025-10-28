"""
Migrate existing wine images from local storage to Cloudinary CDN.
This is a one-time migration script to upload all existing wine images.
"""
import asyncio
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from app.config import settings
from app.services.cloudinary_upload import upload_wine_image


async def migrate_images():
    """Migrate all existing wine images to Cloudinary"""
    
    print("🔗 Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    images_dir = Path(__file__).parent.parent / 'static' / 'wine_images'
    
    if not images_dir.exists():
        print(f"❌ Images directory not found: {images_dir}")
        return
    
    print(f"📂 Scanning images in {images_dir}...")
    migrated = 0
    skipped = 0
    errors = 0
    
    async for wine in db.wines.find({}):
        wine_id = str(wine['_id'])
        wine_name = wine.get('name', 'Unknown')
        old_image_urls = wine.get('image_urls', [])
        
        if not old_image_urls:
            print(f"⏭️  Skipping {wine_name} (no images)")
            skipped += 1
            continue
        
        print(f"\n🍷 Processing: {wine_name}")
        new_image_urls = []
        
        # Process each image for this wine
        for idx, old_url in enumerate(old_image_urls):
            # Extract filename from URL (handle both absolute and relative paths)
            if old_url.startswith('http'):
                # Already a CDN URL, skip
                print(f"  ⏭️  Image {idx}: Already on CDN")
                new_image_urls.append(old_url)
                continue
            
            # Local path - need to migrate
            filename = Path(old_url).name
            local_path = images_dir / filename
            
            if not local_path.exists():
                print(f"  ⚠️  Image {idx}: File not found: {filename}")
                errors += 1
                continue
            
            # Upload to Cloudinary
            print(f"  ⬆️  Uploading image {idx}: {filename}...")
            cdn_url = upload_wine_image(local_path, wine_id, idx)
            
            if cdn_url:
                new_image_urls.append(cdn_url)
                migrated += 1
                print(f"  ✅ Uploaded: {cdn_url}")
            else:
                errors += 1
                print(f"  ❌ Failed to upload: {filename}")
        
        # Update wine with CDN URLs if we have any new URLs
        if new_image_urls and new_image_urls != old_image_urls:
            await db.wines.update_one(
                {'_id': wine['_id']},
                {'$set': {'image_urls': new_image_urls}}
            )
            print(f"  💾 Updated wine in database with {len(new_image_urls)} CDN URLs")
    
    print(f"\n" + "="*60)
    print(f"✅ Migration complete!")
    print(f"📊 Statistics:")
    print(f"  - Images migrated: {migrated}")
    print(f"  - Wines skipped: {skipped}")
    print(f"  - Errors: {errors}")
    print("="*60)
    
    client.close()


if __name__ == "__main__":
    print("🚀 Starting image migration to Cloudinary...")
    print("⚠️  Make sure you have set CLOUDINARY_* environment variables!")
    print()
    
    asyncio.run(migrate_images())

