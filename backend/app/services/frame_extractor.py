"""
Video frame extraction using ffmpeg.
Extracts frames at specific timestamps for wine bottle images.
"""
import subprocess
from pathlib import Path
from typing import List, Optional
import logging
import glob

logger = logging.getLogger(__name__)


def extract_frame(video_path: str, timestamp: float, output_path: str) -> bool:
    """
    Extract a single frame from video at specific timestamp using ffmpeg.
    
    Args:
        video_path: Path to video file
        timestamp: Timestamp in seconds
        output_path: Where to save the frame (e.g., "frame_001.jpg")
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Find ffmpeg location
        ffmpeg_location = None
        possible_paths = [
            r"C:\Users\tanst\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*\bin",
            r"C:\Program Files\ffmpeg\bin",
            r"C:\ffmpeg\bin"
        ]
        for pattern in possible_paths:
            matches = glob.glob(pattern)
            if matches:
                ffmpeg_location = matches[0]
                break
        
        ffmpeg_cmd = str(Path(ffmpeg_location) / "ffmpeg.exe") if ffmpeg_location else "ffmpeg"
        
        # ffmpeg command to extract single frame
        cmd = [
            ffmpeg_cmd,
            '-ss', str(timestamp),  # Seek to timestamp
            '-i', video_path,  # Input file
            '-frames:v', '1',  # Extract exactly 1 frame
            '-q:v', '2',  # Quality (2 = high quality JPEG)
            '-y',  # Overwrite output file
            output_path
        ]
        
        logger.debug(f"Extracting frame at {timestamp:.1f}s: {output_path}")
        
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Verify frame was created
        if Path(output_path).exists() and Path(output_path).stat().st_size > 1000:
            logger.debug(f"Frame extracted successfully ({Path(output_path).stat().st_size} bytes)")
            return True
        else:
            logger.warning(f"Frame extraction produced invalid/tiny file")
            return False
            
    except Exception as e:
        logger.error(f"Error extracting frame at {timestamp}s: {e}")
        return False


def select_best_frame(frame_paths: List[str]) -> Optional[str]:
    """
    Pick the best frame from candidates using simple heuristics.
    
    No ML needed - just basic checks:
    1. Check file exists and is not corrupted
    2. Check file size (blank/dark frames are small)
    3. Return first valid frame (priority already set by timing)
    
    Args:
        frame_paths: List of extracted frame paths (in priority order)
    
    Returns:
        Path to best frame, or None if all invalid
    """
    for frame_path in frame_paths:
        p = Path(frame_path)
        
        if not p.exists():
            continue
        
        # Check file size (blank/dark frames are typically < 10KB)
        size_kb = p.stat().st_size / 1024
        
        if size_kb > 10:  # At least 10KB indicates actual content
            logger.info(f"Selected frame: {frame_path} ({size_kb:.1f}KB)")
            return str(frame_path)
    
    logger.warning("No valid frames found (all too small or missing)")
    return None


def extract_frames_at_times(video_path: str, timestamps: List[float]) -> List[str]:
    """
    Extract multiple frames from video at specified timestamps.
    
    Args:
        video_path: Path to video file
        timestamps: List of timestamps in seconds to extract frames at
    
    Returns:
        List of paths to successfully extracted frames
    """
    frame_paths = []
    video_path_obj = Path(video_path)
    
    # Create frames directory if it doesn't exist
    frames_dir = Path("/app/temp/frames") if Path("/app/temp/frames").exists() else Path("temp/frames")
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract each frame
    for i, timestamp in enumerate(timestamps):
        # Generate output path
        output_path = frames_dir / f"{video_path_obj.stem}_frame_{i}_{int(timestamp*10)}.jpg"
        
        # Extract frame
        if extract_frame(video_path, timestamp, str(output_path)):
            frame_paths.append(str(output_path))
            logger.info(f"Extracted frame {i+1}/{len(timestamps)} at {timestamp:.1f}s")
        else:
            logger.warning(f"Failed to extract frame at {timestamp:.1f}s")
    
    logger.info(f"Successfully extracted {len(frame_paths)}/{len(timestamps)} frames")
    return frame_paths
