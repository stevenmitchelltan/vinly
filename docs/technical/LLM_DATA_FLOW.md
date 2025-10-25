# LLM Data Flow - Complete Analysis

## Current Implementation

### Flow Diagram

```
TikTok Video
    ↓
1. CAPTION (from oEmbed API)
   └─> 200 chars: "Rosé van de LIDL?!! Het wordt..."
    ↓
2. TRANSCRIPTION (from Whisper)
   └─> 1,170 chars: "God, dit is echt facking chemisch. Elke rosé..."
    ↓
3. COMBINE
   └─> "Video Caption: [...]\nVideo Transcription: [...]"
    ↓
4. SEND TO GPT-4o-mini
   └─> System: "You are a wine extraction expert..."
   └─> User: Full prompt with rules + combined text
    ↓
5. GPT RESPONSE
   └─> JSON array of wines
    ↓
6. PARSE & VALIDATE
   └─> Extract valid wines only
    ↓
7. SAVE TO DATABASE
```

---

## What Gets Sent to LLM

### Input Structure

**System Message:**
```
You are a wine data extraction expert. 
Extract structured wine information from Dutch text. 
Always return valid JSON.
```

**User Message (Prompt):**
```
Extract ONLY RECOMMENDED/GOOD wines from this Dutch TikTok content...

IMPORTANT RULES:
1. ONLY extract wines that are RECOMMENDED, POSITIVE, or rated as GOOD
2. SKIP wines that are criticized, rated poorly, or mentioned as "avoid"
3. If a video compares multiple wines, only extract the winners

Text: 
Video Caption: Rosé van de LIDL?!! Het wordt aankomend weekend...

Video Transcription (spoken content): 
God, dit is echt facking chemisch. Elke rosé kan je best pakken...
[Full 1,170 character transcription]

For each RECOMMENDED wine, extract:
1. Exact wine name (brand, variety, year if mentioned)
2. Supermarket (must be one of: Albert Heijn, Dirk, HEMA, LIDL, Jumbo, ALDI, Plus)
   - Accept aliases: AH/Appie = Albert Heijn
3. Wine type (red, white, rose, or sparkling)
4. Rating (positive only)
5. Brief description (what reviewer said POSITIVELY)

Return ONLY valid JSON array with keys: name, supermarket, wine_type, rating, description
If NO RECOMMENDED wines, return: []

Example output:
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

**Parameters:**
- Model: `gpt-4o-mini`
- Temperature: `0.3` (deterministic)
- Max tokens: `1000`

---

## Real Example

### Input (What We Send)

**Caption:**
```
Rosé van de LIDL?!! Het wordt aankomend weekend heerlijk weer dus tijd voor rosé...
```
(200 characters)

**Transcription:**
```
God, dit is echt facking chemisch. Elke rosé kan je best pakken bij de Lidl. 
Vandaag gaan we het testen. 

Eerste, Franse rosé. Hij is net even een klein tikje wat zoeter, dus er zitten 
wat meer suikers in. Maar hij drinkt goed door. Vooral framboos. Voor zijn prijs? 
Goed slobber rosetje hoor.

Tweede, een Pinot Grigio rosé. God, dit is echt facking chemisch. Dit is echt 
tering chemisch. Deze moet je in ieder geval niet pakken.

Primitivo Rosato Puglia. Zonder hebben. Er zit gewoon nul smaak aan.
```
(1,170 characters)

**Combined:** 1,370 characters total

---

### Output (What LLM Returns)

**Raw Response:**
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

**Validation:**
- ✅ Has "name"
- ✅ Supermarket in allowed list (LIDL)
- ✅ Wine type in allowed list (rose)
- ✅ Passed all checks

**What LLM Correctly Filtered:**
- ❌ Pinot Grigio rosé (rated as "chemisch", negative)
- ❌ Primitivo Rosato (rated as "nul smaak", negative)

**Result:** Only 1 GOOD wine extracted ✅

---

## Current Prompt Analysis

### Strengths

✅ **Clear rules** - "ONLY RECOMMENDED/GOOD wines"  
✅ **Structured output** - JSON with specific keys  
✅ **Examples provided** - Shows exact format  
✅ **Validation** - Supermarket must match list  
✅ **Handles Dutch** - Language context provided  

### Potential Issues

⚠️ **Long prompt** - ~1,500 tokens for prompt + data  
⚠️ **Repetitive** - Rules and examples in every call  
⚠️ **Supermarket list** - Sent every time (7 items)  
⚠️ **No few-shot examples** - Could add real examples  

---

## Token Usage

### Per Video (Average)

**Input tokens:**
- Prompt template: ~400 tokens
- Caption: ~50 tokens
- Transcription: ~300 tokens
- **Total input: ~750 tokens**

**Output tokens:**
- JSON response: ~100-200 tokens

**Cost per video:**
- Input: 750 × $0.15/1M = $0.0001125
- Output: 150 × $0.60/1M = $0.00009
- **Total: ~$0.0002 per video**

### For 51 Supermarket Videos

```
Input: 51 × 750 = 38,250 tokens
Output: 51 × 150 = 7,650 tokens

Cost:
Input: $0.0057
Output: $0.0046
Total: $0.0103 (actually very cheap!)
```

---

## Optimization Opportunities

### 1. Use System Message for Rules

**Current:**
```python
messages=[
    {"role": "system", "content": "You are a wine extraction expert..."},
    {"role": "user", "content": "[Long prompt with all rules + data]"}
]
```

**Optimized:**
```python
messages=[
    {"role": "system", "content": """You are a wine extraction expert.

RULES:
1. Extract ONLY RECOMMENDED wines
2. SKIP criticized wines
3. Return JSON array

Supermarkets: Albert Heijn, Jumbo, LIDL, ALDI, HEMA, Dirk, Plus
Wine types: red, white, rose, sparkling

Output format: [{name, supermarket, wine_type, rating, description}]
"""},
    {"role": "user", "content": "Video Caption: [...]\nTranscription: [...]"}
]
```

**Savings:** ~200 tokens per request

---

### 2. Add Few-Shot Examples

Add 2-3 real examples in system message:

```python
{"role": "system", "content": """...

EXAMPLE 1:
Input: "LIDL rosé! Deze Franse is top, 8/10!"
Output: [{"name": "Franse rosé", "supermarket": "LIDL", ...}]

EXAMPLE 2:
Input: "AH Malbec is slecht, niet kopen"
Output: []  # Negative review, skip
"""}
```

**Benefit:** Better accuracy, clearer expectations

---

### 3. Reduce Redundancy

**Current:** Send supermarket list every time  
**Better:** Include once in system message

**Savings:** ~50 tokens per request

---

### 4. Use JSON Mode

OpenAI has a JSON mode that guarantees valid JSON:

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    response_format={"type": "json_object"},  # ← Force JSON
    messages=[...]
)
```

**Benefit:** No need to parse/clean markdown code blocks

---

## Current vs Optimized

### Current Approach

**Tokens per video:** ~750 input + 150 output = 900 total  
**Cost per video:** ~$0.0002  
**Pros:** Works well, clear prompts  
**Cons:** Some redundancy  

### Optimized Approach

**Tokens per video:** ~500 input + 150 output = 650 total  
**Cost per video:** ~$0.00015  
**Savings:** 28% reduction  
**For 51 videos:** Save ~$0.003 per scan  

---

## Recommendations

### Priority 1: High Value

1. **Move rules to system message** - Saves tokens, clearer
2. **Add few-shot examples** - Better accuracy
3. **Use JSON mode** - Cleaner responses

### Priority 2: Nice to Have

4. **Optimize supermarket list** - Small savings
5. **Shorten example format** - Minimal impact

---

## Current Quality Assessment

### What Works Well

✅ **Filtering good vs bad wines** - LLM correctly identifies "avoid" wines  
✅ **Structured extraction** - Consistent JSON format  
✅ **Supermarket normalization** - Handles "AH", "Appie", etc.  
✅ **Type detection** - Correctly identifies red/white/rose/sparkling  

### Areas for Improvement

⚠️ **Wine name specificity** - Sometimes generic ("LIDL rosé" vs "Franse rosé")  
⚠️ **Price extraction** - Not currently captured  
⚠️ **Year detection** - Inconsistent  
⚠️ **Rating normalization** - Various formats ("8/10", "top", "aanrader")  

---

## Proposed Changes

See file: `backend/docs/LLM_OPTIMIZATION_PROPOSALS.md`

Would you like me to implement any of these optimizations?

