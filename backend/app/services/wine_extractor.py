import json
from openai import OpenAI
from typing import List, Dict, Optional
from ..config import settings
from ..utils.config_loader import config

client = OpenAI(api_key=settings.openai_api_key)

# Load from YAML configuration
SUPERMARKETS = config.get_supermarket_list()
WINE_TYPES = config.wine_keywords['wine_types']


def extract_wines_from_text(text: str) -> List[Dict]:
    """
    Extract wine information from text using GPT-4o-mini
    Returns list of wine dictionaries
    """
    if not text or len(text.strip()) < 10:
        return []
    
    prompt = f"""Extract ONLY RECOMMENDED/GOOD wines from this Dutch text about supermarket wines.

IMPORTANT RULES:
1. ONLY extract wines that are RECOMMENDED, POSITIVE, or rated as GOOD
2. SKIP wines that are criticized, rated poorly, or mentioned as "avoid" or "niet goed"
3. If a video compares multiple wines, only extract the winners/recommended ones

Text: {text}

For each RECOMMENDED wine, extract:
1. Exact wine name (brand, variety, year if mentioned)
2. Supermarket (must be one of: {', '.join(SUPERMARKETS)})
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

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a wine data extraction expert. Extract structured wine information from Dutch text. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        result = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if result.startswith("```json"):
            result = result[7:]  # Remove ```json
        if result.startswith("```"):
            result = result[3:]  # Remove ```
        if result.endswith("```"):
            result = result[:-3]  # Remove trailing ```
        result = result.strip()
        
        # Parse JSON response
        wines = json.loads(result)
        
        # Validate and clean results
        valid_wines = []
        for wine in wines:
            if (wine.get("name") and 
                wine.get("supermarket") in SUPERMARKETS and 
                wine.get("wine_type") in WINE_TYPES):
                valid_wines.append(wine)
        
        print(f"Extracted {len(valid_wines)} wines from text")
        return valid_wines
    
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response was: {result}")
        return []
    except Exception as e:
        print(f"Error extracting wines: {e}")
        return []

