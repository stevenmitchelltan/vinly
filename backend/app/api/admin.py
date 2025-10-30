from fastapi import APIRouter, BackgroundTasks, HTTPException, Header
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timezone
import logging
from ..models import ScrapeResponse, WineResponse, WineUpdateRequest, AddTikTokPostRequest
from ..jobs.daily_scraper import run_scraping_job
from ..database import get_database
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_admin_auth(authorization: Optional[str] = Header(None)):
    """Simple header-based authentication for admin endpoints"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Check against environment variable (development uses 'dev')
    expected = settings.admin_password if hasattr(settings, 'admin_password') else 'admin'
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=403, detail="Invalid credentials")


@router.post("/trigger-scrape", response_model=ScrapeResponse)
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Manually trigger the scraping job"""
    background_tasks.add_task(run_scraping_job)
    return ScrapeResponse(
        status="started",
        message="Scraping job has been triggered in the background"
    )


@router.get("/wines", response_model=List[WineResponse])
async def get_all_wines_admin(authorization: Optional[str] = Header(None)):
    """Get all wines with full details for admin editing"""
    verify_admin_auth(authorization)
    
    db = get_database()
    wines = []
    
    async for wine in db.wines.find({}).sort("date_found", -1):
        wines.append(WineResponse(
            id=str(wine["_id"]),
            name=wine["name"],
            supermarket=wine["supermarket"],
            wine_type=wine["wine_type"],
            image_url=wine.get("image_url"),
            image_urls=wine.get("image_urls"),
            rating=wine.get("rating"),
            influencer_source=wine["influencer_source"],
            post_url=wine["post_url"],
            date_found=wine["date_found"],
            in_stock=wine.get("in_stock"),
            description=wine.get("description")
        ))
    
    return wines


@router.put("/wines/{wine_id}")
async def update_wine(
    wine_id: str,
    update_data: WineUpdateRequest,
    authorization: Optional[str] = Header(None)
):
    """Update wine details"""
    verify_admin_auth(authorization)
    
    db = get_database()
    
    # Validate ObjectId
    try:
        obj_id = ObjectId(wine_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid wine ID format")
    
    # Build update document (only include provided fields)
    update_doc = {}
    if update_data.name is not None:
        update_doc["name"] = update_data.name
    if update_data.supermarket is not None:
        update_doc["supermarket"] = update_data.supermarket
    if update_data.wine_type is not None:
        update_doc["wine_type"] = update_data.wine_type
    if update_data.rating is not None:
        update_doc["rating"] = update_data.rating
    if update_data.description is not None:
        update_doc["description"] = update_data.description
    if update_data.image_urls is not None:
        update_doc["image_urls"] = update_data.image_urls
    if update_data.post_url is not None:
        update_doc["post_url"] = update_data.post_url
    if update_data.influencer_source is not None:
        update_doc["influencer_source"] = update_data.influencer_source
    
    if not update_doc:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update in database
    result = await db.wines.update_one(
        {"_id": obj_id},
        {"$set": update_doc}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    return {"status": "success", "message": "Wine updated successfully"}


@router.delete("/wines/{wine_id}")
async def delete_wine(wine_id: str, authorization: Optional[str] = Header(None)):
    """Delete a wine"""
    verify_admin_auth(authorization)
    
    db = get_database()
    
    # Validate ObjectId
    try:
        obj_id = ObjectId(wine_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid wine ID format")
    
    result = await db.wines.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    return {"status": "success", "message": "Wine deleted successfully"}


@router.post("/add-tiktok-post")
async def add_tiktok_post(
    request: AddTikTokPostRequest,
    authorization: Optional[str] = Header(None)
):
    """Process a single TikTok URL and extract wines"""
    verify_admin_auth(authorization)
    
    # Import here to avoid circular dependencies
    from ..scrapers.tiktok_oembed_scraper import TikTokOEmbedScraper
    from ..services.video_downloader import TikTokVideoDownloader
    from ..services.transcription import transcribe_video_audio
    from ..services.wine_extractor import extract_wines_from_caption_and_transcription
    from ..services.frame_extractor import extract_frames_at_times
    from ..services.wine_timing import find_wine_mention_with_signal, get_optimal_frame_times, get_fallback_frame_times
    from ..services.cloudinary_upload import upload_wine_image
    
    db = get_database()
    tiktok_url = request.tiktok_url
    
    try:
        # 1. Fetch video metadata
        scraper = TikTokOEmbedScraper()
        video_data = scraper.get_video_data(tiktok_url)
        
        if not video_data:
            raise HTTPException(status_code=400, detail="Failed to fetch TikTok video data")
        
        caption = video_data.get("caption", "")
        
        # 2. Download video (both audio for transcription and full video for frames)
        downloader = TikTokVideoDownloader()
        
        # Download audio for transcription
        audio_result = downloader.download_video_audio(tiktok_url)
        if not audio_result:
            raise HTTPException(status_code=400, detail="Failed to download audio")
        audio_path, post_date = audio_result
        
        # Download full video for frame extraction
        video_path = downloader.download_full_video(tiktok_url)
        if not video_path:
            raise HTTPException(status_code=400, detail="Failed to download video")
        
        # 3. Transcribe audio
        transcription_result = transcribe_video_audio(audio_path)
        if not transcription_result or transcription_result.get("status") != "success":
            raise HTTPException(status_code=400, detail="Transcription failed")
        
        transcription_text = transcription_result.get("text", "")
        segments = transcription_result.get("segments", [])
        
        # 4. Extract wines
        wines = extract_wines_from_caption_and_transcription(caption, transcription_text)
        
        if not wines:
            return {
                "status": "no_wines",
                "message": "No wines found in this video",
                "wines_added": 0
            }
        
        wines_added = 0
        
        # 5. Process each wine
        for wine_data in wines:
            # Check if this video already has a wine (one wine per video)
            # Using post_url as unique identifier allows safe editing of all fields
            existing = await db.wines.find_one({
                "post_url": tiktok_url
            })
            
            if existing:
                continue  # Skip duplicates
            
            # Find optimal frame times using signal words
            wine_name = wine_data["name"]
            timestamp, method = find_wine_mention_with_signal(wine_name, segments)
            
            if timestamp:
                # Get video duration from transcription
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_optimal_frame_times(timestamp, video_duration)
            else:
                # Fallback if wine not found in transcription
                video_duration = segments[-1]['end'] if segments else 30.0
                frame_times = get_fallback_frame_times(video_duration)
            
            # Extract frames
            frame_paths = extract_frames_at_times(video_path, frame_times)
            
            # Upload to Cloudinary
            # Generate a temporary wine_id for uploads (will be replaced by MongoDB _id)
            import hashlib
            temp_wine_id = hashlib.md5(f"{tiktok_url}_{wine_data['name']}".encode()).hexdigest()[:16]
            
            image_urls = []
            for i, frame_path in enumerate(frame_paths):
                cloudinary_url = upload_wine_image(frame_path, temp_wine_id, i)
                if cloudinary_url:
                    image_urls.append(cloudinary_url)
            
            # Save to database
            wine_doc = {
                "name": wine_data["name"],
                "supermarket": wine_data["supermarket"],
                "wine_type": wine_data["wine_type"],
                "image_urls": image_urls,
                "rating": wine_data.get("rating"),
                "description": wine_data.get("description"),
                "influencer_source": video_data.get("author_name", "manual_add") + "_tiktok",
                "post_url": tiktok_url,
                "date_found": datetime.now(timezone.utc),
                "in_stock": None,
                "last_checked": None
            }
            
            await db.wines.insert_one(wine_doc)
            wines_added += 1
        
        return {
            "status": "success",
            "message": f"Successfully added {wines_added} wine(s)",
            "wines_added": wines_added,
            "wines": [{"name": w["name"], "supermarket": w["supermarket"]} for w in wines]
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing TikTok post: {error_trace}")
        logger.error(f"Error processing TikTok post: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Error processing TikTok post: {str(e)}")


@router.post("/wines/{wine_id}/duplicate")
async def duplicate_wine(wine_id: str, suffix: Optional[str] = "2", authorization: Optional[str] = Header(None)):
    """Duplicate an existing wine as a new entry, allowing multiple wines per video.

    Strategy: keep original video URL unique by adding a fragment suffix (e.g., #2) to post_url.
    Frontend strips the fragment when linking out, so users still reach the original post.
    """
    verify_admin_auth(authorization)
    db = get_database()

    # Validate ObjectId
    try:
        obj_id = ObjectId(wine_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid wine ID format")

    original = await db.wines.find_one({"_id": obj_id})
    if not original:
        raise HTTPException(status_code=404, detail="Wine not found")

    base_url = (original.get("post_url") or "").split("#")[0]
    if not base_url:
        raise HTTPException(status_code=400, detail="Original wine has no post_url")

    # Compute new unique post_url with suffix; auto-increment if needed
    candidate_suffix = (suffix or "2").strip()
    attempt = 0
    new_post_url = None
    while attempt < 20:
        post_url_candidate = f"{base_url}#{candidate_suffix}" if candidate_suffix else f"{base_url}#2"
        exists = await db.wines.find_one({"post_url": post_url_candidate})
        if not exists:
            new_post_url = post_url_candidate
            break
        # increment numeric suffix if collision
        try:
            digits = ''.join(ch for ch in candidate_suffix if ch.isdigit())
            num = int(digits) if digits else 1
            num += 1
            candidate_suffix = str(num)
        except Exception:
            candidate_suffix = "2"
        attempt += 1

    if not new_post_url:
        raise HTTPException(status_code=409, detail="Could not allocate unique post_url suffix")

    # Build new document
    new_doc = {k: v for k, v in original.items() if k != "_id"}
    new_doc["post_url"] = new_post_url
    new_doc["date_found"] = datetime.now(timezone.utc)

    result = await db.wines.insert_one(new_doc)

    return {
        "status": "success",
        "message": "Wine duplicated",
        "wine_id": str(result.inserted_id),
        "post_url": new_post_url,
    }

