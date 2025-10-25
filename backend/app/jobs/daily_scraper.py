import asyncio
from datetime import datetime
from ..database import get_database
from ..scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
from ..services.wine_extractor import extract_wines_from_text
from ..services.inventory_updater import update_inventory_status, mark_stale_wines


async def process_tiktok_videos(tiktok_handle: str, video_urls: list) -> int:
    """
    Process TikTok videos from an influencer
    Returns number of wines added
    """
    db = get_database()
    wines_added = 0
    
    print(f"Processing TikTok: @{tiktok_handle}")
    
    # Initialize TikTok scraper
    scraper = TikTokOEmbedScraper()
    
    # Scrape videos using oEmbed API
    videos = scraper.scrape_profile_videos(tiktok_handle, video_urls)
    
    for video in videos:
        # Get caption
        caption = video.get("caption", "")
        
        if len(caption) < 20:
            continue
        
        # Extract wine information from caption
        wines = extract_wines_from_text(caption)
        
        # Save wines to database
        for wine_data in wines:
            # Check if wine already exists
            existing = await db.wines.find_one({
                "name": wine_data["name"],
                "supermarket": wine_data["supermarket"]
            })
            
            if not existing:
                # Insert wine
                wine_doc = {
                    "name": wine_data["name"],
                    "supermarket": wine_data["supermarket"],
                    "wine_type": wine_data["wine_type"],
                    "image_url": video.get("thumbnail_url"),
                    "rating": wine_data.get("rating"),
                    "description": wine_data.get("description"),
                    "influencer_source": f"{tiktok_handle}_tiktok",
                    "post_url": video["post_url"],
                    "date_found": datetime.utcnow(),
                    "in_stock": None,
                    "last_checked": None
                }
                
                await db.wines.insert_one(wine_doc)
                wines_added += 1
                print(f"Added wine: {wine_data['name']}")
    
    # Update last scraped time
    await db.influencers.update_one(
        {"tiktok_handle": tiktok_handle},
        {"$set": {"last_scraped": datetime.utcnow()}},
        upsert=True
    )
    
    return wines_added


async def run_scraping_job():
    """
    Main scraping job - processes TikTok videos
    
    NOTE: This is a semi-automated approach:
    - Browse TikTok manually to find wine videos
    - Add video URLs to the influencers collection
    - This job extracts wine data from those videos
    """
    print(f"Starting TikTok scraping job at {datetime.utcnow()}")
    
    db = get_database()
    total_wines_added = 0
    
    # Get active TikTok influencers with video URLs
    influencers = []
    async for influencer in db.tiktok_influencers.find({"is_active": True}):
        influencers.append(influencer)
    
    if not influencers:
        print("No TikTok influencers found in database.")
        print("Add influencers with video URLs using the admin panel or scripts.")
        return 0
    
    # Process each influencer's videos
    for influencer in influencers:
        tiktok_handle = influencer.get("tiktok_handle")
        video_urls = influencer.get("video_urls", [])
        
        if not video_urls:
            print(f"No video URLs for @{tiktok_handle}, skipping")
            continue
        
        try:
            wines_added = await process_tiktok_videos(tiktok_handle, video_urls)
            total_wines_added += wines_added
        except Exception as e:
            print(f"Error processing @{tiktok_handle}: {e}")
    
    # Update inventory status for existing wines
    try:
        await update_inventory_status()
        await mark_stale_wines()
    except Exception as e:
        print(f"Error updating inventory: {e}")
    
    print(f"Scraping job completed. Total wines added: {total_wines_added}")
    return total_wines_added


def run_scraping_job_sync():
    """Synchronous wrapper for the scraping job"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(run_scraping_job())
    finally:
        loop.close()
