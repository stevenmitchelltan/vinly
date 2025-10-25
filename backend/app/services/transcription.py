"""
Audio Transcription Service
Transcribes audio files using OpenAI Whisper API
"""
import os
from openai import OpenAI
from typing import Dict
from mutagen.mp3 import MP3
from ..config import settings

client = OpenAI(api_key=settings.openai_api_key)


def get_audio_duration(audio_path: str) -> float:
    """
    Get duration of audio file in seconds
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        Duration in seconds
    """
    try:
        audio = MP3(audio_path)
        return audio.info.length
    except Exception as e:
        print(f"    Warning: Could not get audio duration: {e}")
        # Estimate based on file size (rough approximation)
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        estimated_duration = file_size_mb * 60  # Very rough estimate
        return estimated_duration


def transcribe_audio_file(audio_path: str, retry_count: int = 1) -> Dict:
    """
    Transcribe audio using OpenAI Whisper API
    
    Args:
        audio_path: Path to audio file
        retry_count: Number of retries on failure (default: 1)
    
    Returns:
        {
            'text': transcription text,
            'duration': audio duration in seconds,
            'status': 'success' or 'failed',
            'error': error message if failed
        }
    """
    result = {
        'text': '',
        'duration': 0,
        'status': 'failed',
        'error': ''
    }
    
    try:
        # Get audio duration for cost tracking
        duration = get_audio_duration(audio_path)
        result['duration'] = duration
        
        print(f"    Transcribing audio ({duration:.1f}s)...")
        
        # Attempt transcription with retries
        attempts = 0
        max_attempts = retry_count + 1
        
        while attempts < max_attempts:
            try:
                attempts += 1
                
                with open(audio_path, "rb") as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text",
                        language="nl"  # Dutch language hint
                    )
                
                # Success!
                result['text'] = transcript
                result['status'] = 'success'
                print(f"    Transcribed: {len(transcript)} characters")
                return result
                
            except Exception as e:
                if attempts < max_attempts:
                    print(f"    Transcription attempt {attempts} failed, retrying...")
                else:
                    raise e
        
    except Exception as e:
        error_msg = str(e)
        result['error'] = error_msg
        result['status'] = 'failed'
        print(f"    Transcription failed: {error_msg}")
    
    return result


def transcribe_video_audio(audio_path: str) -> Dict:
    """
    Convenience function: transcribe video audio with default retry
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        Transcription result dict
    """
    return transcribe_audio_file(audio_path, retry_count=1)

