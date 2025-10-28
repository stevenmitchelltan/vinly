"""
Script to add test wine data for development
This bypasses Instagram and lets you test the frontend
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def add_test_wines():
    """Add test wines to database"""
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    # Test wines from various supermarkets
    test_wines = [
        {
            "name": "Albert Heijn Excellent Malbec 2022",
            "supermarket": "Albert Heijn",
            "wine_type": "red",
            "image_url": None,
            "rating": "8/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Een volle rode wijn met mooie fruitige tonen. Uitstekende prijs-kwaliteit verhouding."
        },
        {
            "name": "Jumbo Huismerk Chardonnay",
            "supermarket": "Jumbo",
            "wine_type": "white",
            "image_url": None,
            "rating": "7/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test2",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Frisse witte wijn, perfect voor bij vis. Goed voor deze prijs."
        },
        {
            "name": "LIDL Rosé d'Anjou",
            "supermarket": "LIDL",
            "wine_type": "rose",
            "image_url": None,
            "rating": "7.5/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test3",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Heerlijke zomerse rosé. Zeer betaalbaar en lekker."
        },
        {
            "name": "Dirk Cava Brut",
            "supermarket": "Dirk",
            "wine_type": "sparkling",
            "image_url": None,
            "rating": "8.5/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test4",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Verrassend goede bubbels voor deze prijs. Perfect voor feestjes."
        },
        {
            "name": "HEMA Primitivo di Manduria",
            "supermarket": "HEMA",
            "wine_type": "red",
            "image_url": None,
            "rating": "9/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test5",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Krachtige Italiaanse rode wijn. Absolute aanrader!"
        },
        {
            "name": "ALDI Sauvignon Blanc",
            "supermarket": "ALDI",
            "wine_type": "white",
            "image_url": None,
            "rating": "7/10",
            "influencer_source": "test_data",
            "post_url": "https://instagram.com/p/test6",
            "date_found": datetime.now(timezone.utc),
            "in_stock": True,
            "last_checked": datetime.now(timezone.utc),
            "description": "Frisse witte wijn met goede zuren. Goed voor de zomer."
        }
    ]
    
    count = 0
    for wine in test_wines:
        # Check if exists
        existing = await db.wines.find_one({
            "name": wine["name"],
            "supermarket": wine["supermarket"]
        })
        
        if not existing:
            await db.wines.insert_one(wine)
            print(f"[+] Added: {wine['name']} ({wine['supermarket']})")
            count += 1
        else:
            print(f"[-] Already exists: {wine['name']}")
    
    print(f"\n[DONE] Added {count} test wines!")
    print("\nVisit http://localhost:5173/vinly/ to see them!")
    
    client.close()


if __name__ == "__main__":
    print("Adding test wines to database...\n")
    asyncio.run(add_test_wines())

