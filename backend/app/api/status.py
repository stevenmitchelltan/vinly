from fastapi import APIRouter
from datetime import datetime
from typing import Optional
from ..database import get_database

router = APIRouter()

# In-memory status tracking (simple approach)
scraping_status = {
    "is_running": False,
    "last_run": None,
    "current_influencer": None,
    "status_message": "Idle",
    "wines_found": 0,
    "errors": []
}


@router.get("/status")
async def get_scraping_status():
    """Get current scraping status and recent activity"""
    db = get_database()
    
    # Get recent wines
    recent_wines = []
    async for wine in db.wines.find().sort("date_found", -1).limit(10):
        recent_wines.append({
            "name": wine["name"],
            "supermarket": wine["supermarket"],
            "influencer": wine["influencer_source"],
            "date_found": wine["date_found"]
        })
    
    # Get total counts
    total_wines = await db.wines.count_documents({})
    real_wines = await db.wines.count_documents({"influencer_source": {"$ne": "test_data"}})
    
    return {
        "scraping": scraping_status,
        "database": {
            "total_wines": total_wines,
            "real_wines": real_wines,
            "test_wines": total_wines - real_wines
        },
        "recent_wines": recent_wines
    }


@router.get("/logs")
async def get_recent_logs():
    """Get recent scraping logs"""
    return {
        "logs": scraping_status.get("errors", [])[-20:]  # Last 20 log entries
    }

