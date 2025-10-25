from datetime import datetime, timedelta
from ..database import get_database


async def update_inventory_status():
    """
    Update inventory status for wines in database
    
    NOTE: Currently disabled - supermarket inventory checking removed
    Can be re-enabled later if needed
    """
    print("Inventory checking disabled (feature removed for simplicity)")
    return 0


async def mark_stale_wines():
    """Mark wines older than 30 days as potentially stale"""
    db = get_database()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    result = await db.wines.update_many(
        {"date_found": {"$lt": thirty_days_ago}, "in_stock": {"$ne": False}},
        {"$set": {"in_stock": False}}
    )
    
    print(f"Marked {result.modified_count} old wines as potentially out of stock")
    return result.modified_count
