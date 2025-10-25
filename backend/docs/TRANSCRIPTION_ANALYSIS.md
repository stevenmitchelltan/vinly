# 🎙️ Video Transcription Analysis

## Current Approach vs. Proposed

### 🔴 Current: Caption Only

```
TikTok Video
    ↓
Get caption via oEmbed (free)
    ↓
Send caption to GPT-4o-mini ($0.001)
    ↓
Extract wine data
```

**Pros:**
- ✅ Free (no Whisper cost)
- ✅ Fast (no download/transcription)
- ✅ Simple

**Cons:**
- ❌ Captions are often SHORT (29-200 chars)
- ❌ Missing spoken details (wine name, price, rating)
- ❌ Low information density

**Example:**
- Caption: "LIDL rosé test! #wijn"
- Video says: "De LIDL rosé van 2024, €5.99, Côtes de Provence stijl, 8/10 rating, perfect voor bij bbq"

**Missing:** Specific name, year, price, region, rating, food pairing!

---

### 🟢 Proposed: Caption + Transcription

```
TikTok Video
    ↓
1. Get caption via oEmbed (free)
    ↓
2. Download video audio via yt-dlp (free)
    ↓
3. Transcribe with Whisper API ($0.006/min)
    ↓
4. Combine: caption + transcription
    ↓
5. Send to GPT-4o-mini ($0.001)
    ↓
Extract DETAILED wine data
```

**Pros:**
- ✅ Complete information (everything spoken)
- ✅ Better wine names (exact pronunciation)
- ✅ More ratings and details
- ✅ Higher extraction success rate

**Cons:**
- ❌ Costs more ($0.006 per minute + $0.001 GPT)
- ❌ Slower (download + transcribe)
- ❌ More complex

---

## 💰 Cost Comparison

### Scenario: @pepijn.wijn (10 videos, avg 60 seconds each)

**Caption Only (Current):**
```
10 videos × $0.001 (GPT only) = $0.01
```

**Caption + Transcription:**
```
10 videos × 1 min × $0.006 (Whisper) = $0.06
10 videos × $0.001 (GPT) = $0.01
Total: $0.07 (7x more expensive)
```

### Scenario: Full profile (241 videos)

**Caption Only:**
```
241 videos × $0.001 = $0.24
```

**Caption + Transcription:**
```
241 videos × 1 min × $0.006 = $1.45 (Whisper)
241 videos × $0.001 = $0.24 (GPT)
Total: $1.69 per scan
```

### Monthly Cost (10 influencers, weekly scans)

**Caption Only:**
```
10 influencers × 4 scans × $0.24 = $9.60/month
```

**Caption + Transcription:**
```
10 influencers × 4 scans × $1.69 = $67.60/month
```

**Difference: +$58/month** 💸

---

## 🎯 Quality Improvement Estimate

### Current Success Rate (Caption Only)

From our test:
- 10 videos processed
- 1 wine found
- **Success rate: 10%**

### Estimated with Transcription

Based on similar projects:
- More complete information → better extraction
- **Estimated success rate: 30-50%**

**Example:**
- Current: 241 videos → ~24 wines
- With transcription: 241 videos → ~72-120 wines
- **3-5x more wines extracted!**

---

## 💡 Recommended Approach: Hybrid

### Smart Transcription Strategy

```python
if caption_is_detailed(caption):
    # Caption has enough info (>100 chars with wine details)
    use_caption_only()  # Save $0.006
else:
    # Caption is short/vague (<100 chars)
    transcribe_video()  # Get complete info
    combine(caption, transcription)
```

**Benefits:**
- ✅ Only transcribe when needed (short captions)
- ✅ Save costs on detailed captions
- ✅ Best of both worlds

**Example Decision Tree:**

```
Caption: "LIDL rosé €5.99 - Côtes de Provence 2024, 8/10"
├─> Length: 50 chars
├─> Has: price, region, year, rating
└─> Decision: Skip transcription ✅ (enough info)

Caption: "Rosé test! #lidl"
├─> Length: 18 chars
├─> Has: only type and store
└─> Decision: Transcribe video ✅ (need more info)
```

---

## 📊 Hybrid Cost Analysis

Assuming:
- 30% of videos have detailed captions (skip transcription)
- 70% need transcription

**Per 241 videos:**
```
Detailed captions: 72 × $0.001 = $0.07 (GPT only)
Short captions: 169 × $0.007 = $1.18 (Whisper + GPT)
Total: $1.25 per scan

Savings vs full transcription: $0.44 (26% cheaper)
Still better quality than caption-only!
```

---

## 🎓 Recommendations

### Option 1: Caption Only (Current) 💚
**Best for:** Budget-conscious, testing phase
- Cost: $0.24/scan
- Quality: Low (10% success)
- Speed: Fast

### Option 2: Always Transcribe 🔴
**Best for:** Maximum quality, rich data needed
- Cost: $1.69/scan
- Quality: High (30-50% success)
- Speed: Slow

### Option 3: Hybrid (Smart) 🟡 **RECOMMENDED**
**Best for:** Balance of cost and quality
- Cost: $1.25/scan (26% cheaper than always)
- Quality: High (25-40% success)
- Speed: Medium

---

## 🔧 Implementation Plan

### Phase 1: Add Transcription Support
1. Install `yt-dlp` (video download)
2. Create audio extraction service
3. Integrate OpenAI Whisper API
4. Test on 10 videos

### Phase 2: Implement Hybrid Logic
1. Analyze caption quality
2. Smart decision: transcribe or not
3. Combine caption + transcription
4. Send to GPT-4o-mini

### Phase 3: Monitor & Optimize
1. Track success rates
2. Measure costs
3. Tune caption quality threshold
4. Optimize for best ROI

---

## ❓ Your Decision Needed

Which approach do you prefer?

**A) Keep caption-only** (cheap, simple, lower quality)
- ✅ Current: $0.24/scan
- ❌ Only 10% success rate

**B) Always transcribe** (expensive, best quality)
- ❌ Cost: $1.69/scan  
- ✅ 30-50% success rate

**C) Hybrid approach** (balanced, recommended)
- ✅ Cost: $1.25/scan
- ✅ 25-40% success rate
- ✅ Smart cost optimization

---

## 📝 Next Steps

Once you decide, I'll:
1. Set up video download with `yt-dlp`
2. Integrate Whisper transcription
3. Implement caption quality analyzer
4. Update LLM prompt for combined input
5. Test on real videos

**What's your choice?** A, B, or C?

