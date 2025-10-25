"""
Audio preprocessing utilities for ASR:
- Loudness normalization to ~-16 LUFS
- Optional simple denoise (spectral gating placeholder)
- Optional VAD-based trimming/splitting (placeholder hooks)

Note: Keep this lightweight and fast; we rely on ffmpeg and simple heuristics.
"""
import os
import subprocess
from typing import Optional


def _run_ffmpeg(args: list) -> None:
    process = subprocess.run([
        'ffmpeg', '-y',
        *args
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if process.returncode != 0:
        raise RuntimeError(process.stderr.strip())


def loudness_normalize(input_path: str, output_path: str, target_lufs: float = -16.0) -> str:
    """Normalize loudness using ffmpeg loudnorm filter and convert to mono 16k PCM."""
    # Two-pass loudnorm is ideal, but we keep a single-pass for speed.
    args = [
        '-i', input_path,
        '-ac', '1',
        '-ar', '16000',
        '-af', f"loudnorm=I={target_lufs}:TP=-1.5:LRA=11",
        '-c:a', 'pcm_s16le',
        output_path
    ]
    _run_ffmpeg(args)
    return output_path


def simple_preprocess(input_path: str) -> str:
    """
    Minimal preprocessing pipeline:
    - Loudness normalize to mono 16k PCM
    Returns path to processed WAV.
    """
    base, _ = os.path.splitext(input_path)
    out_path = f"{base}.norm.wav"
    try:
        return loudness_normalize(input_path, out_path)
    except Exception:
        # Fallback: return original if normalization fails
        return input_path


