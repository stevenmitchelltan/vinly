"""
Export wines from MongoDB to static JSON file for GitHub Pages deployment.
This script extracts all wine data and saves it to docs/wines.json for static hosting.
"""
import asyncio
import json
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from app.config import settings


async def export_wines():
    """Export all wines from MongoDB to JSON file"""
    
    print("🔗 Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly
    
    print("📦 Fetching wines from database...")
    wines = []
    
    async for wine in db.wines.find({}).sort("date_found", -1):
        wine_data = {
            'id': str(wine['_id']),
            'name': wine['name'],
            'supermarket': wine['supermarket'],
            'wine_type': wine['wine_type'],
            'price': wine.get('price'),
            'rating': wine.get('rating'),
            'description': wine.get('description'),
            'image_urls': wine.get('image_urls', []),
            'post_url': wine.get('post_url'),
            'influencer_source': wine.get('influencer_source'),
            'date_found': wine.get('date_found').isoformat() if wine.get('date_found') else None
        }
        wines.append(wine_data)
    
    # Prepare output directory
    output_path = Path(__file__).parent.parent.parent / 'docs' / 'wines.json'
    output_path.parent.mkdir(exist_ok=True)
    
    # Write JSON file
    print(f"💾 Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(wines, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(wines)} wines to {output_path}")
    print(f"📊 File size: {output_path.stat().st_size / 1024:.1f} KB")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(export_wines())

