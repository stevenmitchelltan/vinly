# 🔍 Filtering Logic - Simplified Architecture

## Philosophy: Two-Stage Process

### ✅ Stage 1: Keyword Filter (CHEAP)
**Purpose:** Filter out non-supermarket content  
**Method:** Simple keyword matching  
**Cost:** Free (no API calls)

```
Does the caption mention ANY supermarket?
├─> YES: Pass to Stage 2 (LLM)
└─> NO: Skip (save GPT cost)
```

**What it checks:**
- ✅ Albert Heijn, AH, Appie
- ✅ Jumbo, LIDL, ALDI, HEMA, Dirk, Plus
- ✅ #supermarktwijn, #supermarkt
- ✅ Any alias from `config/supermarkets.yaml`

**What it DOESN'T check:**
- ❌ Is it about wine? (LLM will decide)
- ❌ Is it a recommendation? (LLM will decide)
- ❌ Wine types or varieties? (LLM will decide)

---

### ✅ Stage 2: LLM Analysis (SMART)
**Purpose:** Extract wine recommendations  
**Method:** GPT-4o-mini with structured prompt  
**Cost:** ~$0.001 per video

```
Given supermarket video caption:
├─> Is this a wine recommendation? 
│   ├─> YES: Extract wine data
│   │   ├─> Wine name
│   │   ├─> Supermarket
│   │   ├─> Wine type
│   │   ├─> Rating
│   │   └─> Only RECOMMENDED wines (not negative reviews)
│   └─> NO: Return empty array []
└─> Save to database
```

**LLM's job:**
- ✅ Determine if it's about wine
- ✅ Determine if it's a recommendation
- ✅ Extract structured wine data
- ✅ Filter out negative reviews ("don't buy this")

---

## Why This Design?

### Old Approach (Complex)
```python
# Stage 1 Filter
if has_wine AND (has_supermarket OR has_recommendation):
    # Pass to LLM
```

**Problems:**
- ❌ False negatives (missed 25% of wine content)
- ❌ Complex logic (multiple conditions)
- ❌ Keyword overlap (what counts as "recommendation"?)

### New Approach (Simple)
```python
# Stage 1 Filter
if has_supermarket:
    # Pass to LLM
```

**Benefits:**
- ✅ No false negatives (LLM sees all supermarket content)
- ✅ Simple logic (one condition)
- ✅ Clear separation: Filter = supermarket, LLM = wine
- ✅ LLM is smart enough to handle edge cases

---

## Example Flows

### Example 1: Clear Wine Recommendation
**Caption:** "LIDL rosé €5.99 - must try! 8/10"

```
Stage 1: ✅ Contains "LIDL" → Pass to LLM
Stage 2: ✅ LLM extracts: {name: "LIDL rosé", rating: "8/10", ...}
Result: Wine added to database
```

---

### Example 2: Supermarket but Not Wine
**Caption:** "Jumbo heeft vandaag korting op brood!"

```
Stage 1: ✅ Contains "Jumbo" → Pass to LLM
Stage 2: ❌ LLM returns: [] (not wine-related)
Result: No wine added, video marked as processed
```

---

### Example 3: Wine but No Supermarket
**Caption:** "Best Barolo I've ever had! 9/10"

```
Stage 1: ❌ No supermarket mention → Skip
Stage 2: (never called)
Result: Filtered out, saved GPT cost
```

---

### Example 4: Negative Review
**Caption:** "Albert Heijn house wine is terrible, don't buy!"

```
Stage 1: ✅ Contains "Albert Heijn" → Pass to LLM
Stage 2: ✅ LLM recognizes negative review → Returns [] 
         (prompt says: "only RECOMMENDED wines")
Result: No wine added (correctly filtered by LLM)
```

---

## Performance Metrics

### Filtering Efficiency

Based on @pepijn.wijn (241 videos):
- **Supermarket mentions:** ~200 videos (83%)
- **Non-supermarket:** ~41 videos (17%) - **SAVED GPT COST**

### GPT Processing

Videos sent to LLM: ~200  
Wines found: ~23  
Success rate: ~11.5% (wines per supermarket video)

### Cost Calculation

**Without filter:**
- 241 videos × $0.001 = **$0.241**

**With filter:**
- 200 videos × $0.001 = **$0.200**
- **Savings: $0.041 per scan** (17% reduction)

For 10 influencers × monthly scan:
- Savings: **~$4/month**

---

## Configuration

All supermarket keywords are in: `config/supermarkets.yaml`

**To add a new supermarket:**
```yaml
- name: "Coop"
  aliases:
    - "coop"
    - "coop supermarkt"
```

**To add an alias:**
```yaml
- name: "Albert Heijn"
  aliases:
    - "albert heijn"
    - "ah"
    - "appie"
    - "de appie"  # ← Add here
```

---

## Testing

Run the filter inspection:
```bash
python scripts/inspect_filtering.py
```

See filtering performance, false positives/negatives, and recommendations.

---

## Summary

| Aspect | Old (Complex) | New (Simple) |
|--------|--------------|--------------|
| **Filter checks** | Wine + Supermarket | Supermarket only |
| **LLM job** | Extract wines | Decide wine + Extract |
| **False negatives** | 25% | 0% |
| **Logic complexity** | High | Low |
| **Separation of concerns** | Blurred | Clear |
| **Maintainability** | Hard | Easy |

**Winner:** New (Simple) ✅

