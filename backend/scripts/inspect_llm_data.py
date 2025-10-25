"""
Inspect LLM Data Flow

Shows exactly what data is sent to GPT-4o-mini and what comes back
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.wine_extractor import extract_wines_from_caption_and_transcription
from app.utils.config_loader import config


async def inspect_llm_data():
    """
    Show real examples of LLM input/output
    """
    
    print("\n" + "="*70)
    print("  LLM DATA FLOW INSPECTOR")
    print("="*70)
    print()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb
    
    # Get a transcribed video
    video = await db.processed_videos.find_one({
        "transcription_status": "success",
        "is_wine_content": True
    })
    
    if not video:
        print("[ERROR] No transcribed videos found!")
        print("Run: python scripts/transcribe_videos.py first")
        client.close()
        return
    
    caption = video.get("caption", "")
    transcription = video.get("transcription", "")
    video_url = video.get("video_url", "")
    video_id = video_url.split('/')[-1] if video_url else "unknown"
    
    print(f"Example Video: {video_id}")
    print(f"URL: {video_url}")
    print()
    
    # Show what gets combined
    print("="*70)
    print("INPUT DATA (What we have)")
    print("="*70)
    print()
    
    print("1. CAPTION (from TikTok oEmbed):")
    print("-"*70)
    print(caption)
    print()
    print(f"Length: {len(caption)} characters")
    print()
    
    print("2. TRANSCRIPTION (from Whisper API):")
    print("-"*70)
    print(transcription)
    print()
    print(f"Length: {len(transcription)} characters")
    print()
    
    # Show combined text
    combined_text = f"""Video Caption: {caption}

Video Transcription (spoken content): {transcription}"""
    
    print("="*70)
    print("COMBINED INPUT (What's sent to LLM)")
    print("="*70)
    print()
    print(combined_text)
    print()
    print(f"Total length: {len(combined_text)} characters")
    print()
    
    # Show the full prompt
    supermarkets = config.get_supermarket_list()
    wine_types = config.wine_keywords['wine_types']
    
    full_prompt = f"""Extract ONLY RECOMMENDED/GOOD wines from this Dutch TikTok content about supermarket wines.

You may receive both a short caption and a longer transcription of what was spoken in the video.
Use ALL available information to extract wine details.

IMPORTANT RULES:
1. ONLY extract wines that are RECOMMENDED, POSITIVE, or rated as GOOD
2. SKIP wines that are criticized, rated poorly, or mentioned as "avoid" or "niet goed"
3. If a video compares multiple wines, only extract the winners/recommended ones

Text: {combined_text}

For each RECOMMENDED wine, extract:
1. Exact wine name (brand, variety, year if mentioned)
2. Supermarket (must be one of: {', '.join(supermarkets)})
   - Accept aliases: AH/Appie = Albert Heijn
3. Wine type (red, white, rose, or sparkling)
4. Rating (positive only: e.g., "aanrader", "top", "goed", scores 7+/10)
5. Brief description (what the reviewer said POSITIVELY about it)

Return ONLY a valid JSON array of objects with these exact keys: name, supermarket, wine_type, rating, description
If NO RECOMMENDED wines found, return an empty array: []

Example output format:
[
  {{
    "name": "Albert Heijn Excellent Malbec 2022",
    "supermarket": "Albert Heijn",
    "wine_type": "red",
    "rating": "8/10 - aanrader",
    "description": "Uitstekende prijs-kwaliteit, vol en fruitig"
  }}
]"""
    
    print("="*70)
    print("FULL PROMPT (System + User messages)")
    print("="*70)
    print()
    
    print("SYSTEM MESSAGE:")
    print("-"*70)
    print("You are a wine data extraction expert. Extract structured wine information from Dutch text. Always return valid JSON.")
    print()
    
    print("USER MESSAGE:")
    print("-"*70)
    print(full_prompt)
    print()
    
    print(f"Total prompt length: {len(full_prompt)} characters")
    print()
    
    # Now actually call the LLM and show response
    print("="*70)
    print("CALLING LLM...")
    print("="*70)
    print()
    
    wines = extract_wines_from_caption_and_transcription(caption, transcription)
    
    print()
    print("="*70)
    print("LLM OUTPUT (Structured)")
    print("="*70)
    print()
    
    if wines:
        print(f"Extracted {len(wines)} wine(s):")
        print()
        for i, wine in enumerate(wines, 1):
            print(f"{i}. {wine.get('name', 'Unknown')}")
            print(f"   Supermarket: {wine.get('supermarket', 'Unknown')}")
            print(f"   Type: {wine.get('wine_type', 'Unknown')}")
            print(f"   Rating: {wine.get('rating', 'N/A')}")
            print(f"   Description: {wine.get('description', 'N/A')}")
            print()
    else:
        print("[NO WINES EXTRACTED]")
        print("LLM determined this video has no recommended wines")
    
    # Token usage estimate
    print("="*70)
    print("TOKEN & COST ANALYSIS")
    print("="*70)
    print()
    
    # Rough token estimate (1 token ~= 4 characters)
    input_tokens = len(full_prompt) / 4
    output_tokens = 200  # Approximate for JSON response
    
    # GPT-4o-mini pricing (approximate)
    input_cost = (input_tokens / 1000) * 0.00015  # $0.15 per 1M input tokens
    output_cost = (output_tokens / 1000) * 0.0006  # $0.60 per 1M output tokens
    total_cost = input_cost + output_cost
    
    print(f"Estimated input tokens: ~{input_tokens:.0f}")
    print(f"Estimated output tokens: ~{output_tokens:.0f}")
    print(f"Estimated cost: ${total_cost:.6f} per video")
    print()
    
    client.close()


if __name__ == "__main__":
    asyncio.run(inspect_llm_data())

