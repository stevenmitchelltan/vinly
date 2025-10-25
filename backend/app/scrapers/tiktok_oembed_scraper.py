"""
TikTok scraper using oEmbed API
This is how video downloaders work - simple and reliable!
"""
import requests
import re
from typing import List, Dict
from datetime import datetime


class TikTokOEmbedScraper:
    def __init__(self):
        self.oembed_url = "https://www.tiktok.com/oembed"
    
    def get_video_data(self, video_url: str) -> Dict:
        """
        Get video data using TikTok's oEmbed API
        This is the same method downloaders use!
        """
        try:
            response = requests.get(
                self.oembed_url,
                params={'url': video_url},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"oEmbed API returned status: {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"Error fetching video data: {e}")
            return {}
    
    def scrape_profile_videos(self, username: str, video_urls: List[str]) -> List[Dict]:
        """
        Scrape multiple videos from a profile
        You provide the video URLs (can get from browsing TikTok manually)
        """
        videos_data = []
        
        print(f"Scraping TikTok videos from @{username}")
        
        for video_url in video_urls:
            data = self.get_video_data(video_url)
            
            if data:
                video_info = {
                    "post_url": video_url,
                    "caption": data.get('title', ''),
                    "author": data.get('author_name', username),
                    "date": datetime.now(),  # oEmbed doesn't provide date
                    "is_video": True,
                    "thumbnail_url": data.get('thumbnail_url'),
                    "media_files": []
                }
                
                videos_data.append(video_info)
                print(f"  Scraped: {video_url.split('/')[-1]}")
        
        return videos_data

