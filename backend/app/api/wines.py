from fastapi import APIRouter, Query
from typing import Optional, List
from ..database import get_database
from ..models import WineResponse, Supermarket, WineType

router = APIRouter()


@router.get("/wines", response_model=List[WineResponse])
async def get_wines(
    supermarket: Optional[Supermarket] = None,
    wine_type: Optional[WineType] = Query(None, alias="type")
):
    """Get wines filtered by supermarket and/or wine type"""
    db = get_database()
    
    # Build query
    query = {}
    if supermarket:
        query["supermarket"] = supermarket.value
    if wine_type:
        query["wine_type"] = wine_type.value
    
    # Fetch wines
    wines = []
    async for wine in db.wines.find(query).sort("date_found", -1).limit(100):
        wines.append(WineResponse(
            id=str(wine["_id"]),
            name=wine["name"],
            supermarket=wine["supermarket"],
            wine_type=wine["wine_type"],
            image_url=wine.get("image_url"),
            rating=wine.get("rating"),
            influencer_source=wine["influencer_source"],
            post_url=wine["post_url"],
            date_found=wine["date_found"],
            in_stock=wine.get("in_stock"),
            description=wine.get("description")
        ))
    
    return wines


@router.get("/supermarkets")
async def get_supermarkets():
    """Get list of available supermarkets"""
    return {
        "supermarkets": [
            {"name": "Albert Heijn", "value": "Albert Heijn"},
            {"name": "Dirk", "value": "Dirk"},
            {"name": "HEMA", "value": "HEMA"},
            {"name": "LIDL", "value": "LIDL"},
            {"name": "Jumbo", "value": "Jumbo"},
            {"name": "ALDI", "value": "ALDI"},
            {"name": "Plus", "value": "Plus"}
        ]
    }

