# LLM Extraction Improvements

## Issues Identified

**Problem 1:** No feedback from LLM about WHY wines are rejected
- User can't see the LLM's reasoning
- Hard to debug why wines aren't extracted
- Can't tell if it's a prompt issue or data issue

**Problem 2:** Prompt is too strict
- Line 129: "If unclear, return an empty array"
- Line 145: "If no clear winner is stated, return []"
- Rejects wines that are positive but not explicitly "highly recommended"
- Example: A wine that's "a clear winner" in a comparison might be rejected if the language isn't strong enough

---

## Solution 1: Add LLM Reasoning Output

### Changes Needed

**1. Update Prompt to Request Reasoning**

Change the output format from:
```json
[
  {
    "name": "...",
    "supermarket": "...",
    ...
  }
]
```

To:
```json
{
  "wines": [
    {
      "name": "...",
      "supermarket": "...",
      ...
    }
  ],
  "reasoning": "Why this wine was extracted (or why no wine was found)"
}
```

**2. Update Response Parsing**

In `wine_extractor.py` around line 220-240, change from:
```python
wines = json.loads(cleaned)
return wines
```

To:
```python
response_obj = json.loads(cleaned)
wines = response_obj.get("wines", [])
reasoning = response_obj.get("reasoning", "No reasoning provided")

# Log the reasoning
print(f"LLM Reasoning: {reasoning}")
logger.info(f"LLM extraction reasoning: {reasoning}")

return wines
```

**3. Return Reasoning to Frontend**

Update `/api/admin/add-tiktok-post` endpoint to include reasoning in response:
```python
if not wines:
    return {
        "status": "no_wines",
        "message": "No wines found in this video",
        "reasoning": reasoning,  # NEW
        "wines_added": 0
    }
```

---

## Solution 2: Relax the Prompt

### Key Changes to Make

**1. Change line 129 from:**
```
4. Return AT MOST ONE wine: choose the single BEST recommendation (most positive language or highest rating). If unclear, return an empty array.
```

**To:**
```
4. Return AT MOST ONE wine: choose the single BEST recommendation
5. INCLUDE wines that are:
   - Explicitly recommended or praised
   - Described as a "winner" or "top choice" in comparisons
   - Given positive attributes even without strong superlatives
   - Presented as "good value" or "worth trying"
6. Be INCLUSIVE rather than overly strict - if the wine is presented positively overall, include it
```

**2. Change line 145 from:**
```
- Handle enumerations (bijv. 1/2/3, links/midden/rechts, A vs B). Extract ONLY the explicit winnaar/aanrader/beste
- If no clear winner is stated, return []
```

**To:**
```
- Handle enumerations (bijv. 1/2/3, links/midden/rechts, A vs B). Extract the explicit winnaar/aanrader/beste
- If comparison shows one wine is clearly better than others, that's the one to extract
```

---

## Implementation Steps

### Step 1: Update the Prompt (wine_extractor.py lines 120-199)

Add these guidelines after line 129:
```python
5. INCLUDE wines that are:
   - Explicitly recommended or praised
   - Described as a "winner" or "top choice" in comparisons
   - Given positive attributes even without strong superlatives
   - Presented as "good value" or "worth trying"
6. Be INCLUSIVE rather than overly strict - if the wine is presented positively overall, include it
```

### Step 2: Add Reasoning to Prompt Output

Add after line 186 (before the example output):
```python
6. REASONING: A brief explanation of why you extracted this wine (or why you didn't extract any)
   - If extracting: explain why this wine is recommended
   - If not extracting: explain what's missing (no recommendation, no supermarket, unclear wine, etc.)
   - Max 1-2 sentences
```

Change the example output format:
```python
Return a valid JSON object with this structure:
{{
  "wines": [ /* array with 0 or 1 wine object */ ],
  "reasoning": "Brief explanation of the extraction decision"
}}

If a wine was found, the wine object should have: name, supermarket, wine_type, rating, description
If NO wine is found, return: {{"wines": [], "reasoning": "explanation of why no wine was extracted"}}

Example output format:
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
  "reasoning": "This wine is recommended as a clear winner in the comparison and is explicitly sold at Jumbo"
}}
```

### Step 3: Update Response Parsing (wine_extractor.py ~line 220-240)

Find the section that parses the JSON response and update it:

```python
# OLD:
wines = json.loads(cleaned)
if not isinstance(wines, list):
    print(f"LLM did not return a list. Response: {cleaned[:200]}")
    return []

# NEW:
response_obj = json.loads(cleaned)

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
    print(f"LLM returned unexpected format: {cleaned[:200]}")
    return []

# Log the reasoning for debugging
print(f"    LLM Reasoning: {reasoning}")
logger.info(f"Wine extraction reasoning: {reasoning}")

# Continue with validation...
if not isinstance(wines, list):
    print(f"    wines field is not a list: {wines}")
    return []
```

### Step 4: Return Reasoning to User (admin.py ~line 180-190)

Update the "no wines" response to include reasoning:

```python
if not wines:
    # Get reasoning from last extraction attempt
    # You'll need to modify extract_wines_from_caption_and_transcription
    # to return both wines and reasoning
    return {
        "status": "no_wines",
        "message": "No wines found in this video",
        "llm_reasoning": "Check backend logs for LLM reasoning",  # Or pass it through
        "wines_added": 0
    }
```

### Step 5: Display Reasoning in Frontend (Admin.jsx ~line 120-140)

Update the error handling:

```jsx
} catch (error) {
  console.error('Failed to add TikTok post:', error);
  
  // Check if error response has reasoning
  const reasoning = error.response?.data?.llm_reasoning;
  const message = reasoning 
    ? `Failed to add TikTok post: ${error.response?.data?.message}\n\nLLM Reasoning: ${reasoning}`
    : `Failed to add TikTok post: ${error.response?.data?.detail || error.message}`;
  
  alert(message);
}
```

---

## Testing

### Test Case 1: Your Video (7353670393489657120)

**Before changes:**
```
Result: No wines found
Reasoning: Unknown (not visible)
```

**After changes (expected):**
```
Result: Wine extracted OR detailed reasoning why not
Reasoning: 
  If extracted: "This wine is shown as the clear winner in the comparison..."
  If not: "No supermarket was explicitly mentioned for this wine" 
      or "The recommendation was not clear enough"
```

### Test Case 2: Clearly Positive Wine

**Video with:** "Deze Chardonnay van Albert Heijn is echt lekker!"

**Expected:**
```
Wine extracted: Yes
Reasoning: "Explicit recommendation with supermarket mentioned"
```

### Test Case 3: No Supermarket

**Video with:** "Deze wijn is top, maar van de wijnwinkel"

**Expected:**
```
Wine extracted: No
Reasoning: "Wine is from a specialty store, not a supported supermarket"
```

---

## Summary of Changes

| File | Lines | Change |
|------|-------|--------|
| `backend/app/services/wine_extractor.py` | 129 | Add "INCLUDE wines that..." guidelines |
| `backend/app/services/wine_extractor.py` | 145 | Soften "no clear winner" rule |
| `backend/app/services/wine_extractor.py` | 186 | Add "REASONING" field to output spec |
| `backend/app/services/wine_extractor.py` | 188-199 | Change output format to include reasoning |
| `backend/app/services/wine_extractor.py` | 220-240 | Parse new format and log reasoning |
| `backend/app/api/admin.py` | 180-190 | Return reasoning in API response |
| `frontend/src/pages/Admin.jsx` | 120-140 | Display LLM reasoning in error messages |

---

## Benefits

1. ✅ **Visibility**: See why LLM rejected a wine
2. ✅ **Debugging**: Identify prompt issues vs. data issues
3. ✅ **Inclusivity**: More wines will be accepted (if positive overall)
4. ✅ **Transparency**: Users understand the system's decisions

---

## Next Steps

1. **I can implement these changes** - Would you like me to apply them?
2. **Or you can manually apply** - Using this guide as reference

Let me know how you'd like to proceed!

