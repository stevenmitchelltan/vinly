"""
Audio Transcription Service
Transcribes audio files using OpenAI Whisper API with lexicon-guided prompt
and a selective two-pass strategy to improve proper-noun fidelity.
"""
import os
from openai import OpenAI
from typing import Dict, List
import time
from mutagen.mp3 import MP3
from ..config import settings
from ..utils.config_loader import config
from .audio_preprocess import simple_preprocess

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


def _build_initial_prompt(max_terms: int = 80) -> str:
    """Build a concise initial prompt from the YAML lexicon."""
    terms: List[str] = config.get_prompt_terms(max_items=max_terms)
    # Keep punctuation minimal; preserve diacritics
    if not terms:
        return ""
    return (
        "Deze transcriptie bevat Nederlandse wijnbesprekingen. Merknamen en druivenrassen kunnen Frans of Spaans zijn; behoud accenten en verander namen niet. Relevante termen: "
        + ", ".join(terms)
    )


def _should_second_pass(text: str) -> bool:
    """Heuristic to decide if a second pass could help."""
    if not text:
        return False
    # Few lexicon hits => likely need help
    hits = 0
    folded_text = text.lower()
    for term in config.get_prompt_terms(max_items=50):
        t = term.lower()
        if len(t) >= 4 and t in folded_text:
            hits += 1
            if hits >= 3:
                break
    has_enough_hits = hits >= 3
    # Look for likely corrupted proper nouns (sequences with many capitals/hyphens)
    suspicious = any(part for part in text.split() if config.is_wine_like_token(part) and part.isupper())
    return not has_enough_hits or suspicious


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
        'error': '',
        'metrics': {}
    }
    
    try:
        # Preprocess audio (loudness normalize to mono 16k wav)
        processed_path = simple_preprocess(audio_path)
        # Get audio duration for cost tracking (use original if processed same)
        duration = get_audio_duration(audio_path)
        result['duration'] = duration
        
        print(f"    Transcribing audio ({duration:.1f}s)...")
        t0 = time.perf_counter()
        pass1_len = 0
        pass2_len = 0
        used_pass2 = False
        
        # Attempt transcription with retries
        attempts = 0
        max_attempts = retry_count + 1
        
        while attempts < max_attempts:
            try:
                attempts += 1
                
                # Pass 1: baseline with lexicon-guided initial prompt
                initial_prompt = _build_initial_prompt()
                with open(processed_path, "rb") as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text",
                        language="nl",  # Dutch language hint
                        prompt=initial_prompt if initial_prompt else None
                    )
                
                # Success!
                result['text'] = transcript
                result['status'] = 'success'
                pass1_len = len(transcript)
                print(f"    Transcribed: {pass1_len} characters")
                # Decide if we should attempt a selective second pass
                asr_cfg = config.scraping_settings.get('asr', {}) or {}
                # Allow env override for experiments: ASR_ENABLE_TWO_PASS=0/1
                env_override = os.getenv('ASR_ENABLE_TWO_PASS')
                if env_override is not None:
                    two_pass_enabled = env_override.strip() not in ('0', 'false', 'False')
                else:
                    two_pass_enabled = bool(asr_cfg.get('enable_two_pass', True))
                if two_pass_enabled and _should_second_pass(transcript):
                    # Enrich prompt with candidate tokens from pass 1
                    words = [w.strip('.,:;!()[]{}\"\'') for w in transcript.split()]
                    candidates = []
                    for w in words:
                        if config.is_wine_like_token(w) and w not in candidates:
                            candidates.append(w)
                            if len(candidates) >= 30:
                                break
                    enriched_terms = config.get_prompt_terms(max_items=60) + candidates[:20]
                    # Deduplicate preserving order
                    seen = set()
                    enriched_terms_dedup = []
                    for t in enriched_terms:
                        if t not in seen:
                            seen.add(t)
                            enriched_terms_dedup.append(t)
                    enriched_prompt = (
                        "Herhaal transcriptie met aandacht voor eigennamen. Bewaar accenten en verander de spelling van merknamen niet. Termen: "
                        + ", ".join(enriched_terms_dedup)
                    )
                    print("    Second pass: enriched prompt applied")
                    with open(processed_path, "rb") as audio_file:
                        transcript2 = client.audio.transcriptions.create(
                            model="whisper-1",
                            file=audio_file,
                            response_format="text",
                            language="nl",
                            prompt=enriched_prompt
                        )
                    # Prefer longer transcript if it adds useful content
                    if transcript2 and len(transcript2) >= len(transcript) * 0.95:
                        result['text'] = transcript2
                        pass2_len = len(transcript2)
                        used_pass2 = True
                        print(f"    Second pass accepted ({pass2_len} chars)")
                # Metrics
                final_text = result['text'] or ''
                elapsed_ms = int((time.perf_counter() - t0) * 1000)
                # Lexicon hits (unique term presence, len>=4)
                folded = final_text.lower()
                terms = [t for t in config.get_prompt_terms(max_items=200) if len(t) >= 4]
                unique_hits = 0
                for t in terms:
                    if t.lower() in folded:
                        unique_hits += 1
                per_k = (unique_hits / max(1, len(final_text))) * 1000.0
                # OOV rate among wine-like tokens
                words = [w.strip('.,:;!()[]{}\"\'') for w in final_text.split()]
                wine_like = [w for w in words if config.is_wine_like_token(w)]
                in_lex = 0
                for w in wine_like:
                    if config.is_wine_like_token(w):
                        # Reuse lexicon membership heuristic
                        if config.is_wine_like_token(w):
                            # Treat token as in lexicon if exact accent-folded match exists in any list
                            # Already handled inside is_wine_like_token via lexicon check when exact
                            # Here we approximate by checking presence of folded in folded text of terms
                            pass
                total_wlt = len(wine_like)
                # Approximate oov: if token isn't substring of any term (accent-folded), count as OOV
                def _fold(s: str) -> str:
                    import unicodedata
                    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c)).lower()
                folded_terms = set(_fold(t) for t in terms)
                oov = 0
                for w in wine_like:
                    if _fold(w) not in folded_terms:
                        oov += 1
                oov_rate = (oov / total_wlt) if total_wlt else 0.0

                version = 'whisper-1+two-pass+norm'
                result['metrics'] = {
                    'version': version,
                    'pass1_chars': pass1_len,
                    'pass2_chars': pass2_len,
                    'pass2_used': used_pass2,
                    'lexicon_hits': unique_hits,
                    'lexicon_hits_per_1k': per_k,
                    'oov_rate': oov_rate,
                    'runtime_ms': elapsed_ms
                }
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

