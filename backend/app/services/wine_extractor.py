import json
import re
import logging
from openai import OpenAI
from typing import List, Dict, Optional
from ..config import settings
from ..utils.config_loader import config

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.openai_api_key)

# Load from YAML configuration
SUPERMARKETS = config.get_supermarket_list()
WINE_TYPES = config.wine_keywords['wine_types']


BANNED_RATING_PHRASES = {
    "echt een toppertje",
    "absolute aanrader",
    "duidelijke winnaar",
    "heel lekker",
}

ATTRIBUTE_ORDER = [
    "fruitig",
    "fris",
    "kruidig",
    "vol",
    "zacht",
    "mineraal",
    "hout",
    "tannines",
    "zuur",
    "zoet",
    "balans",
    "complex",
    "prijs-kwaliteit",
]


def _normalize_rating(rating: Optional[str], description: Optional[str]) -> Optional[str]:
    """Ensure rating is short, non-numeric, and not a cliché.

    - Remove numeric score fragments (e.g., "8/10", "7.5/10").
    - Replace banned clichés with a concise attribute-based phrase from description.
    """
    if not rating:
        return rating

    original = rating.strip()
    lowered = original.lower()

    # Remove numeric ratings like "8/10" or "7.5 / 10" while preserving original casing elsewhere
    no_numeric_original = re.sub(r"\b\d+(?:[.,]\d+)?\s*/\s*10\b", "", original)
    no_numeric_original = re.sub(r"\b\d+(?:[.,]\d+)?\s*/\s*\d+\b", "", no_numeric_original)
    no_numeric_original = no_numeric_original.strip(" -–—:;,.!")

    no_numeric_lowered = re.sub(r"\b\d+(?:[.,]\d+)?\s*/\s*10\b", "", lowered)
    no_numeric_lowered = re.sub(r"\b\d+(?:[.,]\d+)?\s*/\s*\d+\b", "", no_numeric_lowered)
    no_numeric_lowered = no_numeric_lowered.strip(" -–—:;,.!")

    # If numeric part was the only content, fall back to description-derived phrase
    candidate = no_numeric_original if no_numeric_lowered else ""

    # If banned cliché, derive from description
    if no_numeric_lowered in BANNED_RATING_PHRASES or lowered in BANNED_RATING_PHRASES:
        candidate = ""

    if not candidate:
        desc = (description or "").lower()
        if desc:
            attrs = [a for a in ATTRIBUTE_ORDER if a in desc]
            if len(attrs) >= 2:
                return f"{attrs[0]} en {attrs[1]}"
            if attrs:
                return attrs[0]
            if "prijs" in desc or "kwaliteit" in desc:
                return "sterke prijs-kwaliteit"
        # If nothing to derive, keep original without numeric pieces
        return no_numeric_original or original

    return candidate


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
4. Return AT MOST ONE wine: choose the single BEST recommendation
5. INCLUDE wines that are:
   - Explicitly recommended or praised
   - Described as a "winner", "top choice", or "best" in comparisons
   - Given positive attributes even without strong superlatives
   - Presented as "good value" or "worth trying"
   - Shown positively in a comparison (even if not using words like "beste")
6. Be INCLUSIVE rather than overly strict - if the wine is presented positively overall, include it

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
- Handle enumerations (bijv. 1/2/3, links/midden/rechts, A vs B). Extract the explicit winnaar/aanrader/beste
- If comparison shows one wine is clearly better than others (even without explicit "winner" language), extract that one
- Look for context clues like "deze is beter", "dit vind ik lekkerder", or positive framing vs negative framing

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
4. RATING: A short, enthusiastic phrase (max 3–6 words) capturing the influencer's verdict
   - Prefer a short verbatim quote from the influencer if it directly expresses the verdict (e.g., “dit is mijn favoriet”).
   - Do NOT use numeric scores (e.g., no "8/10").
   - Avoid generic clichés (e.g., "echt een toppertje", "absolute aanrader", "duidelijke winnaar", "heel lekker") unless quoted verbatim in the input.
   - If synthesizing, include at least one concrete attribute (taste note, pairing, price/quality, balance) and match the influencer's tone.
   - Vary wording; avoid repeating the same phrase across different wines.
5. DESCRIPTION: A more elaborate description or quote from the influencer about the wine
   - Prefer verbatim quotes from the transcript/caption; otherwise paraphrase faithfully
   - Include taste notes, characteristics, or why it's recommended
   - Can be longer (10-20 words) to capture the full flavor profile or recommendation reasoning
   - Examples: "Vol en fruitig met mooie tannines, perfect bij rood vlees", "Verrassend fris en kruidig voor de prijs"

Return a valid JSON object with this structure:
{{
  "wines": [ /* array with 0 or 1 wine object */ ],
  "reasoning": "Brief explanation of your extraction decision"
}}

The wine object (if present) should have these exact keys: name, supermarket, wine_type, rating, description

REASONING field guidelines:
- If wine extracted: Explain WHY this wine is recommended (e.g., "Explicitly praised as winner in comparison" or "Positive attributes and sold at Albert Heijn")
- If NO wine: Explain WHAT is missing (e.g., "No supermarket mentioned" or "Wine criticized, not recommended" or "Only from wine shop, not supermarket")
- Keep it brief (1-2 sentences max)
- Be specific about the decision factor

Example output when wine found:
{{
  "wines": [
    {{
      "name": "Côtes du Rhône",
      "supermarket": "Jumbo",
      "wine_type": "red",
      "rating": "Mooi in balans",
      "description": "Soepele rode wijn met fijne kruidigheid en zacht fruit, goede prijs-kwaliteit verhouding"
    }}
  ],
  "reasoning": "Wine is clearly recommended with positive attributes and explicitly sold at Jumbo"
}}

Example output when NO wine found:
{{
  "wines": [],
  "reasoning": "No supermarket was explicitly mentioned for this wine"
}}"""

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
        response_obj = json.loads(result)
        
        # Handle both old format (array) and new format (object with wines + reasoning)
        if isinstance(response_obj, list):
            # Old format - convert to new format
            wines = response_obj
            reasoning = "No reasoning provided (old format response)"
        elif isinstance(response_obj, dict):
            # New format
            wines = response_obj.get("wines", [])
            reasoning = response_obj.get("reasoning", "No reasoning provided")
        else:
            print(f"    LLM returned unexpected format: {result[:200]}")
            return []
        
        # Log the reasoning for debugging
        print(f"    LLM Reasoning: {reasoning}")
        logger.info(f"Wine extraction reasoning: {reasoning}")
        
        # Debug: log what LLM actually returned
        if wines:
            print(f"    LLM returned {len(wines)} wine(s):")
            for wine in wines:
                print(f"      - Name: {wine.get('name')}")
                print(f"        Supermarket: {wine.get('supermarket')} (valid: {wine.get('supermarket') in SUPERMARKETS})")
                print(f"        Type: {wine.get('wine_type')} (valid: {wine.get('wine_type') in WINE_TYPES})")
        
        # Validate and clean results (enforce max 1 winner)
        valid_wines = []
        for wine in wines:
            # Normalize wine_type: rosé → rose (remove accent)
            wine_type = wine.get("wine_type", "").lower()
            if wine_type == "rosé":
                wine_type = "rose"
            wine["wine_type"] = wine_type
            
            if (wine.get("name") and 
                wine.get("supermarket") in SUPERMARKETS and 
                wine.get("wine_type") in WINE_TYPES):
                valid_wines.append(wine)
            else:
                # Log why this wine was rejected
                if not wine.get("name"):
                    print(f"    ❌ Rejected: Missing name")
                elif wine.get("supermarket") not in SUPERMARKETS:
                    print(f"    ❌ Rejected: Invalid supermarket '{wine.get('supermarket')}' (must be one of: {SUPERMARKETS})")
                elif wine.get("wine_type") not in WINE_TYPES:
                    print(f"    ❌ Rejected: Invalid wine_type '{wine.get('wine_type')}' (must be one of: {WINE_TYPES})")
        
        if len(valid_wines) > 1:
            valid_wines = valid_wines[:1]

        # Normalize ratings to avoid numeric scores and clichés
        for w in valid_wines:
            w["rating"] = _normalize_rating(w.get("rating"), w.get("description"))

        print(f"Extracted {len(valid_wines)} wines from text")
        return valid_wines
    
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response was: {result}")
        return []
    except Exception as e:
        print(f"Error extracting wines: {e}")
        return []

