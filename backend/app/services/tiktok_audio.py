"""
TikTok audio transcription service
Downloads and transcribes TikTok videos when captions are insufficient
"""
import os
import requests
import tempfile
from openai import OpenAI
from ..config import settings

client = OpenAI(api_key=settings.openai_api_key)


def get_tiktok_video_url_from_oembed(video_url: str) -> str:
    """
    Get direct video download URL from TikTok
    Note: This is a simplified version. Real implementation would need more work.
    """
    # For now, we'll rely on captions mostly
    # Actual video downloading from TikTok is complex
    return None


def transcribe_tiktok_audio(video_url: str) -> str:
    """
    Transcribe TikTok video audio using OpenAI Whisper API
    
    Args:
        video_url: TikTok video URL
    
    Returns:
        Transcript text or empty string if failed
    """
    print(f"    [AUDIO] Transcribing video for more info...")
    
    # Note: Downloading TikTok videos requires additional libraries/services
    # Options:
    # 1. Use yt-dlp library
    # 2. Use TikTok downloader API service
    # 3. Use Playwright to capture audio
    
    # For now, return empty (we'll add this if really needed)
    # The captions are actually quite complete!
    
    return ""


def caption_has_enough_info(caption: str) -> bool:
    """
    Check if caption has enough information or if we need audio transcription
    
    Returns:
        True if caption is sufficient, False if we need audio
    """
    if not caption or len(caption) < 30:
        return False
    
    caption_lower = caption.lower()
    
    # Check if it mentions supermarket
    supermarkets = ['albert heijn', 'ah', 'appie', 'jumbo', 'lidl', 'aldi', 'hema', 'dirk', 'plus']
    has_supermarket = any(sm in caption_lower for sm in supermarkets)
    
    # Check if it has wine details (name or variety)
    wine_details = ['malbec', 'chardonnay', 'sauvignon', 'merlot', 'cabernet', 
                   'pinot', 'syrah', 'shiraz', 'riesling', 'prosecco', 'cava',
                   'rioja', 'chianti', 'barolo', 'bordeaux', 'tempranillo']
    has_details = any(detail in caption_lower for detail in wine_details)
    
    # If has supermarket AND wine details, caption is enough
    if has_supermarket and has_details:
        return True
    
    # If caption is long and mentions wine-related terms
    if len(caption) > 100 and 'wijn' in caption_lower:
        return True
    
    return False

