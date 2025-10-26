"""
TikTok Video Downloader
Downloads TikTok videos using yt-dlp for audio transcription
"""
import os
import yt_dlp
from typing import Optional


class TikTokVideoDownloader:
    def __init__(self):
        self.download_dir = "temp/videos"
        os.makedirs(self.download_dir, exist_ok=True)
    
    def download_with_ytdlp(self, video_url: str) -> Optional[tuple]:
        """
        Download video using yt-dlp (primary method)
        
        Args:
            video_url: TikTok video URL
        
        Returns:
            Tuple (audio_path, post_date_datetime) or None if failed
        """
        try:
            # Extract video ID from URL for filename
            video_id = video_url.split('/')[-1]
            
            # Find ffmpeg location (Windows WinGet installation)
            ffmpeg_location = None
            import glob
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
            
            # yt-dlp options
            ydl_opts = {
                'format': 'bestaudio/best',  # Download best audio quality
                'outtmpl': f'{self.download_dir}/{video_id}.%(ext)s',
                'quiet': True,
                'no_warnings': True,
                'extract_audio': True,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }
            
            # Add ffmpeg location if found
            if ffmpeg_location:
                ydl_opts['ffmpeg_location'] = ffmpeg_location
                print(f"    Using ffmpeg from: {ffmpeg_location}")
            
            print(f"    Downloading video audio: {video_id}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                
                # Construct the output filename
                audio_file = f"{self.download_dir}/{video_id}.mp3"
                
                if os.path.exists(audio_file):
                    print(f"    Downloaded: {audio_file}")
                    # Determine post date from info
                    post_dt = None
                    try:
                        if info.get('timestamp'):
                            from datetime import datetime, timezone
                            post_dt = datetime.fromtimestamp(info['timestamp'], tz=timezone.utc)
                        elif info.get('upload_date'):
                            # upload_date is YYYYMMDD
                            s = str(info['upload_date'])
                            from datetime import datetime, timezone
                            post_dt = datetime.strptime(s, '%Y%m%d').replace(tzinfo=timezone.utc)
                    except Exception:
                        post_dt = None
                    return (audio_file, post_dt)
                else:
                    print(f"    Warning: Expected file not found: {audio_file}")
                    return None
                    
        except Exception as e:
            print(f"    Error downloading video: {e}")
            return None
    
    def download_video_audio(self, video_url: str) -> Optional[tuple]:
        """
        Main method: Download video audio
        
        Currently uses yt-dlp directly (research showed no reliable direct URL method)
        
        Args:
            video_url: TikTok video URL
        
        Returns:
            Tuple (audio_path, post_date_datetime) or None if failed
        """
        return self.download_with_ytdlp(video_url)
    
    def download_full_video(self, video_url: str) -> Optional[str]:
        """
        Download full video (not just audio) for frame extraction.
        
        Args:
            video_url: TikTok video URL
        
        Returns:
            Path to downloaded video file, or None if failed
        """
        try:
            video_id = video_url.split('/')[-1]
            
            # Find ffmpeg location
            ffmpeg_location = None
            import glob
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
            
            # yt-dlp options for full video
            ydl_opts = {
                'format': 'best',  # Download best quality video
                'outtmpl': f'{self.download_dir}/{video_id}.%(ext)s',
                'quiet': True,
                'no_warnings': True,
            }
            
            if ffmpeg_location:
                ydl_opts['ffmpeg_location'] = ffmpeg_location
            
            print(f"    Downloading full video: {video_id}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                
                # Find the downloaded video file
                video_file = ydl.prepare_filename(info)
                
                if os.path.exists(video_file):
                    print(f"    Downloaded video: {video_file}")
                    return video_file
                else:
                    print(f"    Warning: Video file not found: {video_file}")
                    return None
                    
        except Exception as e:
            print(f"    Error downloading full video: {e}")
            return None
    
    def cleanup_audio_file(self, audio_path: str):
        """Remove audio file after successful transcription"""
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                print(f"    Cleaned up: {audio_path}")
        except Exception as e:
            print(f"    Warning: Could not remove {audio_path}: {e}")
    
    def cleanup_video_file(self, video_path: str):
        """Remove video file after frame extraction"""
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                print(f"    Cleaned up video: {video_path}")
        except Exception as e:
            print(f"    Warning: Could not remove {video_path}: {e}")

