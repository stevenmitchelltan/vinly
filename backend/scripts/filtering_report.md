# 🔍 Filtering Inspection Report

## Summary Statistics

- **Total videos processed:** 241
- **Wine-related (passed filter):** 214 (88.8%)
- **Filtered out:** 27 (11.2%)

## Filter Accuracy Test

**Sample size:** 20 videos  
**Correct predictions:** 15/20 (75.0%)  
**False positives:** 0 (good!)  
**False negatives:** 5 (missed actual wine content)

---

## 🎯 Key Findings

### ✅ What's Working Well

1. **No False Positives** - The filter doesn't let non-wine content through
2. **88.8% of videos passed** - Most wine content is being caught
3. **High recall** - Getting most supermarket wine recommendations

### ⚠️ What Needs Improvement

**5 False Negatives Detected:**

Videos that ARE wine content but were missed by the current filter logic:

1. **"DRUIVEN STOOMCURSUS! Tempranillo!"**
   - Educational wine content (grape varieties)
   - Doesn't mention a specific supermarket
   - But still valuable wine knowledge

2. **"Groot Phesantekraal Sauvignon Blanc - €9.49"**
   - Specific wine recommendation with price
   - Mentions price point (under €10)
   - Likely from a supermarket but not explicitly stated

3. **"Chardonnay blind test! #test"**
   - Wine tasting content
   - Has #test hashtag (recommendation keyword)
   - But short caption, no supermarket

4. **Wine pairing content**
   - "Waar op letten bij SPICY eten en wijn??"
   - Educational but no supermarket mention

5. **Rosé recommendations**
   - "ROSÉ VAN WERELDBEROEMDE HUIZEN?"
   - Wine recommendation but no supermarket

---

## 🔍 Root Cause Analysis

### Current Filter Logic

```python
# Requires BOTH conditions:
1. Must mention "wijn" (wine) ✓
2. Must mention a supermarket OR recommendation keyword ✓

# The issue:
Some videos have wine content but don't explicitly 
mention supermarkets in the caption
```

### Why This Happens

Looking at the missed examples:
- **Short captions** - "Chardonnay blind test! #test"
- **Educational content** - Grape variety info
- **Price mentions but no store** - "€9.49" but no "Jumbo" or "AH"

---

## 💡 Recommendations

### Option 1: Keep Current Filter (Conservative)
**Pros:**
- Zero false positives
- Only gets explicitly supermarket-related content
- Saves GPT costs

**Cons:**
- Misses 25% of potential wine content
- May miss good recommendations

### Option 2: Relax Filter (Liberal)
Add more "supermarket hint" keywords:
- Price mentions: "€", "euro", "prijs onder"
- Value keywords: "goedkoop", "budget", "betaalbaar"
- Location: "gekocht bij", "te koop"

**Pros:**
- Catches more wine content (higher recall)
- Won't miss recommendations

**Cons:**
- May process more educational content
- Slightly higher GPT costs

### Option 3: Two-Stage Filter (Smart)
1. **Stage 1:** Current strict filter
2. **Stage 2:** If caption is SHORT (<50 chars), lower the threshold

**Pros:**
- Best of both worlds
- Catches "Chardonnay blind test!" type posts
- Still avoids obvious non-supermarket content

---

## 📊 Current Keywords Loaded

**Wine keywords:** 4 terms
- wijn, wijntje, wijnen, wijntest

**Supermarket keywords:** 22 terms  
- albert heijn, ah, appie, ah wijn, #ah, jumbo, lidl, aldi, hema, dirk, plus, etc.

**Recommendation keywords:** 12 terms
- test, aanrader, top, koopje, deal, prijs, onder, goedkoop, etc.

---

## 🎯 Suggested Next Steps

1. **Review the false negatives** - Decide if they should pass
2. **Add keywords** to `wine_keywords.yaml`:
   - Price indicators: "€", "euro", "prijs"
   - Value keywords: "goedkoop", "budget"
   - Purchase: "gekocht", "te koop"
3. **Test again** with updated keywords
4. **Monitor GPT costs** to ensure savings remain

