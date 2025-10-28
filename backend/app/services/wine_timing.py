"""
Wine mention timing detection from Whisper transcription segments.
Used to determine when to extract video frames showing the wine bottle.
"""
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


def find_wine_mention_timestamp(wine_name: str, segments: list) -> Optional[float]:
    """
    Find when the wine is mentioned in the transcription.
    
    Args:
        wine_name: Wine name to search for (e.g., "Côtes du Rhône")
        segments: Whisper segments with timestamps
                  [{"start": 0.0, "end": 5.2, "text": "..."}, ...]
    
    Returns:
        Timestamp in seconds when wine is mentioned, or None if not found
    """
    if not segments or not wine_name:
        return None
    
    # Normalize wine name for matching
    wine_normalized = wine_name.lower().strip()
    wine_words = wine_normalized.split()
    
    logger.debug(f"Searching for wine '{wine_name}' in {len(segments)} segments")
    
    # Search through segments
    for segment in segments:
        text = segment.get('text', '').lower()
        
        # Check if full wine name appears in this segment
        if wine_normalized in text:
            logger.info(f"Found wine mention at {segment['start']:.1f}s: '{segment['text'][:50]}...'")
            return segment['start']
        
        # Check for partial matches (first significant word, brand, region)
        for word in wine_words:
            if len(word) > 4 and word in text:
                logger.info(f"Found partial match '{word}' at {segment['start']:.1f}s")
                return segment['start']
    
    logger.warning(f"Wine '{wine_name}' not found in transcription segments")
    return None


def get_optimal_frame_times(mention_time: float, video_duration: float) -> List[float]:
    """
    Generate list of good timestamps to extract frames with better spread.
    
    Strategy - Maximum Diversity (ALWAYS 6 frames):
    1. Just after mention (showing bottle)
    2. Well before mention (intro/establishing shot)
    3. During mention (speaking while showing)
    4. Later after mention (still in frame)
    5. Early in video (first impression)
    6. Late discussion (conclusion/recommendation)
    
    Args:
        mention_time: When wine was mentioned (seconds)
        video_duration: Total video length (seconds)
    
    Returns:
        List of timestamps to try (in priority order, spread out) - ALWAYS 6 timestamps
    """
    times = []
    
    # 1. Primary: Just after mention (0.75s - most likely showing bottle)
    times.append(min(mention_time + 0.75, video_duration))
    
    # 2. Before mention - intro shot (adaptive based on video length)
    before_offset = min(2.0, mention_time * 0.3)
    if mention_time > 1:
        times.append(max(1, mention_time - before_offset))
    else:
        times.append(max(1, video_duration * 0.15))  # Fallback: 15% into video
    
    # 3. During/slightly after mention
    times.append(min(mention_time + 1.5, video_duration))
    
    # 4. Well after mention - still discussing
    times.append(min(mention_time + 4.0, video_duration - 1))
    
    # 5. Early in video - first impression (always include)
    early_time = max(2, min(mention_time * 0.2, mention_time - 3)) if mention_time > 5 else video_duration * 0.2
    times.append(max(1, min(early_time, video_duration)))
    
    # 6. Late discussion - conclusion (always include)
    late_time = min(mention_time + 7.0, video_duration - 2)
    if late_time <= mention_time + 4.5:  # If too close to #4, use percentage-based
        late_time = video_duration * 0.85
    times.append(max(1, min(late_time, video_duration)))
    
    # Ensure all times are unique and within valid range
    valid_times = []
    seen = set()
    for t in times:
        t_rounded = round(t, 1)
        if 0 <= t_rounded <= video_duration and t_rounded not in seen:
            valid_times.append(t_rounded)
            seen.add(t_rounded)
    
    # If we still don't have 6 unique times, fill with evenly spaced frames
    while len(valid_times) < 6:
        # Add frames at strategic intervals
        step = video_duration / 7  # Divide into 7 segments to get 6 new frames
        for i in range(1, 7):
            candidate = step * i
            candidate_rounded = round(candidate, 1)
            if candidate_rounded not in seen and 0 <= candidate_rounded <= video_duration:
                valid_times.append(candidate_rounded)
                seen.add(candidate_rounded)
                if len(valid_times) >= 6:
                    break
        break  # Prevent infinite loop
    
    # Ensure exactly 6 frames (or video_duration if shorter)
    valid_times = valid_times[:6]
    
    logger.debug(f"Generated {len(valid_times)} frame times with spread around {mention_time:.1f}s: {[f'{t:.1f}' for t in valid_times]}")
    
    return valid_times


def get_fallback_frame_times(video_duration: float) -> List[float]:
    """
    Generate fallback frame times when wine mention is not found.
    
    Strategy - ALWAYS extract 6 diverse frames:
    - Avoid first few seconds (intro/transitions)
    - Sample evenly across video for maximum diversity
    - Most wine influencers show bottle throughout video
    
    Args:
        video_duration: Total video length (seconds)
    
    Returns:
        List of timestamps to try - ALWAYS 6 timestamps
    """
    times = []
    
    # Skip first 2 seconds and last 2 seconds for safer extraction
    safe_start = 2
    safe_end = max(safe_start + 1, video_duration - 2)
    safe_duration = safe_end - safe_start
    
    # Generate 6 evenly spaced timestamps across the safe zone
    if safe_duration > 0:
        step = safe_duration / 7  # 7 segments = 6 frames in between
        for i in range(1, 7):
            times.append(round(safe_start + (step * i), 1))
    else:
        # Very short video - just use middle frame repeated (ffmpeg will handle it)
        middle = video_duration / 2
        for _ in range(6):
            times.append(round(middle, 1))
    
    logger.debug(f"Using fallback frame times for {video_duration:.1f}s video: {times}")
    
    return times

