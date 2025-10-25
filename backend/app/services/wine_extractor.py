import json
from openai import OpenAI
from typing import List, Dict, Optional
from ..config import settings
from ..utils.config_loader import config

client = OpenAI(api_key=settings.openai_api_key)

# Load from YAML configuration
SUPERMARKETS = config.get_supermarket_list()
WINE_TYPES = config.wine_keywords['wine_types']


def extract_wines_from_caption_and_transcription(
    caption: str, 
    transcription: Optional[str] = None
) -> List[Dict]:
    """
    Extract wines from combined caption + transcription
    Falls back to caption-only if no transcription
    
    Args:
        caption: TikTok video caption
        transcription: Video audio transcription (optional)
    
    Returns:
        List of wine dictionaries
    """
    if transcription and len(transcription.strip()) > 20:
        # Combine both sources for maximum information
        combined_text = f"""Video Caption: {caption}

Video Transcription (spoken content): {transcription}"""
        print("    Using caption + transcription")
    else:
        # Fallback to caption only
        combined_text = caption
        print("    Using caption only (no transcription)")
    
    return extract_wines_from_text(combined_text)


def extract_wines_from_text(text: str) -> List[Dict]:
    """
    Extract wine information from text using GPT-4o-mini
    Returns list of wine dictionaries
    """
    if not text or len(text.strip()) < 10:
        return []
    
    prompt = f"""Extract ONLY RECOMMENDED/GOOD wines from this Dutch TikTok content about supermarket wines.

You may receive both a short caption and a longer transcription of what was spoken in the video.
Use ALL available information to extract wine details.

IMPORTANT RULES:
1. ONLY extract wines that are RECOMMENDED, POSITIVE, or rated as GOOD
2. SKIP wines that are criticized, rated poorly, or mentioned as "avoid" or "niet goed"
3. If a video compares multiple wines, only extract the winners/recommended ones
4. Return AT MOST ONE wine: choose the single BEST recommendation (most positive language or highest rating). If unclear, return an empty array.

NAME NORMALIZATION / CORRECTION:
- Correct obvious transcription errors in wine names and appellations; PRESERVE accents/diacritics and native spelling
- Prefer canonical appellations/regions when brand is unclear (e.g., "Koteroon" → "Côtes du Rhône")
- Do NOT invent brands. If uncertain of the exact brand, output the best canonical name you’re confident about (brand omitted), or return [] if truly unclear
- Keep language in Dutch for descriptive fields; keep proper nouns in their native form

ORDERING HEURISTIC (INTRO FIRST → EXPLANATION AFTER):
- Influencers typically FIRST name the wine, THEN provide an explanation
- Prioritize wine names that appear EARLY in the transcript/caption
- If multiple candidates are mentioned, pick the earliest candidate that is later described positively and is available at a supported supermarket
- Do not switch to a later-mentioned wine unless the earliest one is clearly rejected/criticized

COMPARATIVE VIDEOS & WINNER SELECTION:
- Handle enumerations (bijv. 1/2/3, links/midden/rechts, A vs B). Extract ONLY the explicit winnaar/aanrader/beste
- If no clear winner is stated, return []

PRONOUN RESOLUTION:
- Resolve “deze/die/dit” to the nearest prior concrete wine mention; do not create a new wine entity for pronouns alone

NEGATIVE OVERRIDES:
- If the earliest candidate is later criticized (bijv. matig/slecht/skip/niet aan te raden), discard it and continue searching for a later positive winner

SUPERMARKET VALIDATION (CRITICAL - STRICTLY ENFORCE):
- The wine MUST be purchased/available at one of these specific supermarkets: {', '.join(SUPERMARKETS)}
- The supermarket name MUST be explicitly stated in the context of THIS SPECIFIC WINE
- Accept aliases ONLY when mentioned: AH/Appie = Albert Heijn, but must be explicitly stated
- REJECT if:
  * Wine is from a "wijnwinkel" (wine shop) or specialty store
  * Generic "supermarkt" mentioned without specifying which one
  * Supermarket mentioned in unrelated context (e.g., general guide, other videos)
  * No clear connection between the wine and a specific supermarket from the list
- If you cannot identify which supermarket sells this specific wine, return []
- NEVER guess a supermarket - it must be explicitly stated
- Treat "Plus"/"PLUS" case-sensitively; ignore generic "plus"

RUIS NEGEREN:
- Negeer intros/outros, disclaimers, CTA's en muziek‑only gedeelten; focus op evaluatie en conclusie

Text: {text}

Extract the SINGLE BEST RECOMMENDED wine with:
1. Exact wine name (brand, variety, year if mentioned). If brand is unclear, provide the canonical appellation/region + style instead
2. Supermarket (must be one of: {', '.join(SUPERMARKETS)})
   - Accept aliases: AH/Appie = Albert Heijn, but the alias must be explicitly mentioned
3. Wine type (red, white, rose, or sparkling)
4. RATING: A short, enthusiastic phrase (max 3-5 words) capturing the influencer's verdict
   - Prefer phrases like: "duidelijke winnaar", "echt een toppertje", "mooie balans", "absolute aanrader", "verrassend goed", but infer from context.
   - Can include quality indicators or superlatives that show enthusiasm
   - Keep the influencer's tone and language style
5. DESCRIPTION: A more elaborate description or quote from the influencer about the wine
   - Prefer verbatim quotes or paraphrases from the transcript/caption
   - Include taste notes, characteristics, or why it's recommended
   - Can be longer (10-20 words) to capture the full flavor profile or recommendation reasoning
   - Examples: "Vol en fruitig met mooie tannines, perfect bij rood vlees", "Verrassend fris en kruidig voor de prijs, echt een toppertje"

Return ONLY a valid JSON array with AT MOST ONE object having these exact keys: name, supermarket, wine_type, rating, description
If NO RECOMMENDED wine is clearly identified, return an empty array: []

Example output format:
[
  {{
    "name": "Côtes du Rhône",
    "supermarket": "Jumbo",
    "wine_type": "red",
    "rating": "Dit is de winnaar!",
    "description": "Soepele rode wijn met fijne kruidigheid en zacht fruit, goede prijs-kwaliteit verhouding"
  }}
]"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a wine data extraction expert for Dutch supermarket wines. CRITICAL RULE: Only extract wines if the supermarket is EXPLICITLY mentioned by name. Valid supermarkets: {', '.join(SUPERMARKETS)}. If the text mentions 'wijnwinkel' (wine shop) or generic 'supermarkt' without specifying which one, return []. NEVER guess which supermarket - it must be clearly stated in the text. Correct and normalize misheard wine names (preserve accents), prefer canonical names when brand is unclear, never invent brands. Return valid JSON only."},
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
        
        # Validate and clean results (enforce max 1 winner)
        valid_wines = []
        for wine in wines:
            if (wine.get("name") and 
                wine.get("supermarket") in SUPERMARKETS and 
                wine.get("wine_type") in WINE_TYPES):
                valid_wines.append(wine)
        if len(valid_wines) > 1:
            valid_wines = valid_wines[:1]
        
        print(f"Extracted {len(valid_wines)} wines from text")
        return valid_wines
    
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response was: {result}")
        return []
    except Exception as e:
        print(f"Error extracting wines: {e}")
        return []

