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
    Generate list of good timestamps to extract frames based on when wine was mentioned.
    
    Strategy:
    - Influencers typically show the bottle WHILE or just AFTER mentioning it
    - Main frame: 0.5-1.5 seconds after mention (showing bottle)
    - Backup frames: Just before and well after mention
    - All times must be within valid video range
    
    Args:
        mention_time: When wine was mentioned (seconds)
        video_duration: Total video length (seconds)
    
    Returns:
        List of timestamps to try (in priority order)
    """
    times = []
    
    # Primary: 0.5-1.5 seconds after mention (most likely showing bottle)
    times.append(mention_time + 0.75)
    times.append(mention_time + 1.25)
    
    # Secondary: Just before mention (intro/establishing shot)
    if mention_time > 2:
        times.append(mention_time - 1.0)
        times.append(mention_time - 0.5)
    
    # Tertiary: Well after mention (still discussing/showing)
    times.append(mention_time + 2.5)
    times.append(mention_time + 3.5)
    
    # Filter to valid range (0 to video_duration)
    valid_times = [t for t in times if 0 <= t <= video_duration]
    
    logger.debug(f"Generated {len(valid_times)} frame times around {mention_time:.1f}s")
    
    return valid_times


def get_fallback_frame_times(video_duration: float) -> List[float]:
    """
    Generate fallback frame times when wine mention is not found.
    
    Strategy:
    - Avoid first few seconds (intro/transitions)
    - Sample from middle portion of video
    - Most wine influencers show bottle in middle section
    
    Args:
        video_duration: Total video length (seconds)
    
    Returns:
        List of timestamps to try
    """
    times = []
    
    # Skip first 3 seconds and last 2 seconds
    if video_duration > 10:
        # Sample from 20%, 40%, 60% of video
        times.append(video_duration * 0.2)
        times.append(video_duration * 0.4)
        times.append(video_duration * 0.6)
    elif video_duration > 5:
        # Short video - just middle
        times.append(video_duration * 0.5)
    else:
        # Very short video - middle frame
        times.append(video_duration / 2)
    
    logger.debug(f"Using fallback frame times for {video_duration:.1f}s video: {times}")
    
    return times

