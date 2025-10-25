# LLM Prompt - Real Example

## Complete LLM Interaction

This shows EXACTLY what gets sent to GPT-4o-mini and what comes back.

---

## INPUT TO LLM

### Message 1: System Role

```
You are a wine data extraction expert. 
Extract structured wine information from Dutch text. 
Always return valid JSON.
```

### Message 2: User Prompt

```
Extract ONLY RECOMMENDED/GOOD wines from this Dutch TikTok content about supermarket wines.

You may receive both a short caption and a longer transcription of what was spoken in the video.
Use ALL available information to extract wine details.

IMPORTANT RULES:
1. ONLY extract wines that are RECOMMENDED, POSITIVE, or rated as GOOD
2. SKIP wines that are criticized, rated poorly, or mentioned as "avoid" or "niet goed"
3. If a video compares multiple wines, only extract the winners/recommended ones

Text: 
Video Caption: Rosé van de LIDL?!! Het wordt aankomend weekend heerlijk weer dus tijd voor rosé. Er is deze week alleen geen parel ontdekt. Als je dan een fles rosé haalt bij de Lidl. Ga dan voor de eerste. Moet

Video Transcription (spoken content): God, dit is echt facking chemisch. Elke rosé kan je best pakken bij de Lidl. Vandaag gaan we het testen. Eerste, Franse rosé. Hij is net even een klein tikje wat zoeter, dus er zitten wat meer suikers in. Dus het is niet dat je je mond er helemaal van gaat samentrekken. Maar hij drinkt goed door. Vooral framboos moet ik zeggen. Verder zit er niet superveel in, maar dat hoeft ook niet. Voor zijn prijs? Goed slobber rosetje hoor. Goed slobber rosetje. Tweede, een Pinot Grigio rosé. God, dit is echt facking chemisch. Dit is echt tering chemisch. Het kan toch niet dat je dit maakt, een slok neemt en dan elkaar aankijkt en denkt... Dit is hem. Dit is mijn man. Dit is niet te schrijven man. Niet te lang over lullen. Deze moet je in ieder geval niet pakken. Primitivo Rosato Puglia. Zonder hebben. Goed, ik ruik al een beetje de alcohol doorheen. Er zit gewoon geen smaak aan. Er zit gewoon nul smaak aan. Het is in ieder geval duidelijk dat ik niet gesponsord word door de Lidl lijkt me. Daar kun je je plantenwater mee geven. Als iemand dit in mijn glas doet, vind ik het helemaal prima. Als iemand dit in mijn glas doet, dan zijn we geen vrienden meer, denk ik.

For each RECOMMENDED wine, extract:
1. Exact wine name (brand, variety, year if mentioned)
2. Supermarket (must be one of: Albert Heijn, Dirk, HEMA, LIDL, Jumbo, ALDI, Plus)
   - Accept aliases: AH/Appie = Albert Heijn
3. Wine type (red, white, rose, or sparkling)
4. Rating (positive only: e.g., "aanrader", "top", "goed", scores 7+/10)
5. Brief description (what the reviewer said POSITIVELY about it)

Return ONLY a valid JSON array of objects with these exact keys: name, supermarket, wine_type, rating, description
If NO RECOMMENDED wines found, return an empty array: []

Example output format:
[
  {
    "name": "Albert Heijn Excellent Malbec 2022",
    "supermarket": "Albert Heijn",
    "wine_type": "red",
    "rating": "8/10 - aanrader",
    "description": "Uitstekende prijs-kwaliteit, vol en fruitig"
  }
]
```

**Model Parameters:**
- Temperature: 0.3 (mostly deterministic)
- Max tokens: 1000

---

## OUTPUT FROM LLM

### Raw Response

```json
[
  {
    "name": "Franse rosé",
    "supermarket": "LIDL",
    "wine_type": "rose",
    "rating": "Goed slobber rosetje",
    "description": "Zoeter met framboos, drinkt goed door, goede prijs-kwaliteit"
  }
]
```

### What LLM Did

✅ **Identified 3 wines in video:**
1. Franse rosé - RECOMMENDED ("Goed slobber rosetje")
2. Pinot Grigio rosé - NEGATIVE ("echt facking chemisch")
3. Primitivo Rosato - NEGATIVE ("nul smaak aan")

✅ **Extracted only #1** (the recommended one)  
✅ **Filtered #2 and #3** (negative reviews)  
✅ **Returned valid JSON**  
✅ **Correct supermarket** (LIDL)  
✅ **Correct type** (rose)  

---

## Validation & Processing

### Step 1: Parse JSON

```python
wines = json.loads(result)
# Result: [{"name": "Franse rosé", ...}]
```

### Step 2: Validate Each Wine

```python
for wine in wines:
    if (wine.get("name") and 
        wine.get("supermarket") in SUPERMARKETS and 
        wine.get("wine_type") in WINE_TYPES):
        valid_wines.append(wine)
```

**Checks:**
- ✅ Has name? Yes
- ✅ Supermarket valid? Yes (LIDL in list)
- ✅ Wine type valid? Yes (rose in list)

**Result:** 1 valid wine ✅

### Step 3: Save to Database

```javascript
{
  "name": "Franse rosé",
  "supermarket": "LIDL",
  "wine_type": "rose",
  "rating": "Goed slobber rosetje",
  "description": "Zoeter met framboos...",
  "influencer_source": "pepijn.wijn_tiktok",
  "post_url": "https://www.tiktok.com/...",
  "date_found": "2025-10-25...",
  "image_url": "[thumbnail]",
  "in_stock": null
}
```

---

## Token Analysis

### Token Breakdown

**Input tokens (per video):**
```
System message:          ~50 tokens
Prompt template:        ~400 tokens
Caption:                 ~50 tokens
Transcription:          ~300 tokens
Rules & examples:       ~200 tokens
-----------------------------------
Total input:            ~1,000 tokens
```

**Output tokens:**
```
JSON response:          ~100 tokens
```

**Total:** ~1,100 tokens per video

### Cost Calculation

**GPT-4o-mini pricing:**
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**Per video:**
- Input: 1,000 × $0.15/1M = $0.00015
- Output: 100 × $0.60/1M = $0.00006
- **Total: $0.00021 per video**

**For 51 videos:**
- Total: $0.0107 (very cheap!)

---

## Optimization Ideas

### 1. Move Static Content to System Message

**Current:** Repeats rules/examples in every user message  
**Better:** Move to system message (sent once)

**Savings:** ~200 tokens per request = $0.00003 per video  
**Impact:** Small but cleaner

### 2. Add Price Extraction

**Current:** Not extracted  
**Better:** Add to extraction fields

```python
"price": "€5.99"  # NEW field
```

**Benefit:** More useful data for users

### 3. Normalize Ratings

**Current:** Various formats ("8/10", "top", "goed slobber")  
**Better:** Normalize to score

```python
"rating_score": 8,  # 1-10 scale
"rating_text": "Goed slobber rosetje"
```

**Benefit:** Can sort wines by rating

### 4. Use JSON Mode

**Current:** Parse markdown-wrapped JSON  
**Better:** Use `response_format: json_object`

```python
response_format={"type": "json_object"}
```

**Benefit:** Guaranteed valid JSON, no parsing issues

---

## Issues Found

### Issue 1: Caption-Only Extraction

**Problem:** Smart scraper was extracting wines from captions before transcription

**Fix:** Updated `smart_scraper.py` to skip if no transcription:
```python
if not transcription:
    print("[NO TRANSCRIPTION] Skipping wine extraction")
    continue  # ← Skip until transcribed
```

**Status:** ✅ FIXED

### Issue 2: Failed Transcription

**Video:** 7366627118324796704  
**Error:** "Audio download failed"

**Possible causes:**
- Video deleted/private
- TikTok rate limiting
- Network issue

**Solution:** 
- Created `retry_failed_transcriptions.py` to retry
- Falls back gracefully (marks as failed, no crash)

**Status:** ✅ HANDLED

---

## Current Workflow (Corrected)

```
1. Smart Scraper
   └─> Finds supermarket videos
   └─> Marks for transcription
   └─> Does NOT extract wines yet

2. Transcribe Videos
   └─> Downloads audio
   └─> Transcribes with Whisper
   └─> Stores in database

3. Re-extract Wines
   └─> Smart scraper (re-run)
   └─> Now has transcriptions
   └─> Extracts wines with caption + transcription
   └─> Saves to database
```

---

## Quality Metrics

### Extraction Accuracy

Based on LIDL rosé example:

**What LLM Correctly Did:**
- ✅ Identified 3 wines in transcription
- ✅ Extracted only the RECOMMENDED one
- ✅ Skipped 2 negative reviews
- ✅ Extracted specific variety ("Franse rosé")
- ✅ Summarized tasting notes accurately
- ✅ Captured rating sentiment

**Accuracy:** 100% on this example ✅

---

## Next Steps

Want to optimize the LLM prompts? Options:

**A)** Keep current (works well, very cheap)  
**B)** Optimize for tokens (save ~$0.003 per scan)  
**C)** Add price extraction (more useful data)  
**D)** All of the above

Current cost is only $0.01 per scan (very cheap!), so optimization might not be critical unless scaling to 100+ influencers.

