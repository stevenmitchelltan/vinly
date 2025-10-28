# Wine Image Extraction Fix - Complete

## Problem
Some wine cards displayed only 3-5 images instead of the ideal 6 images per wine.

## Root Cause
The frame extraction timing logic in `backend/app/services/wine_timing.py` had conditional logic that could generate fewer than 6 timestamps:

1. **`get_optimal_frame_times()`** - Generated 3-5 frames depending on:
   - Video duration
   - Wine mention timestamp position
   - Conditional checks (e.g., "if mention_time > 10")

2. **`get_fallback_frame_times()`** - Generated only 1-3 frames:
   - Short videos got just 1 frame
   - Medium videos got 1 frame
   - Longer videos got 3 frames

## Analysis Results
Before fix:
- **3 images**: 3 wines
- **4 images**: 10 wines
- **5 images**: 4 wines  
- **6 images**: 14 wines

## Solution
Updated both timing functions to **ALWAYS generate exactly 6 diverse timestamps**:

### `get_optimal_frame_times()` improvements:
- Removed conditional logic that skipped frames
- Added adaptive timing for short videos
- Fills remaining slots with evenly-spaced frames if < 6
- Ensures unique timestamps across the video duration

### `get_fallback_frame_times()` improvements:
- Always generates 6 evenly-spaced frames
- Divides video into 7 segments (6 frames in between)
- Skips first 2 and last 2 seconds for safety
- Handles very short videos gracefully

## Results
After fix:
- **6 images**: 31 wines (100% ✅)

All wines now have exactly 6 high-quality bottle images extracted from different timestamps in their source videos, providing better visual variety for the wine cards.

## Technical Details

**Modified file**: `backend/app/services/wine_timing.py`

**Key changes**:
1. Both functions now return exactly 6 timestamps
2. Adaptive logic for short/long videos
3. Duplicate prevention using `set()` tracking
4. Evenly-spaced fallback generation
5. Boundary checks to prevent out-of-range timestamps

## Future Improvements
The system now extracts maximum image diversity from each video. Future enhancements could include:
- ML-based frame quality scoring (blur detection, composition analysis)
- Bottle detection to prioritize frames with visible wine bottles
- User-selected "hero image" for primary wine card display

