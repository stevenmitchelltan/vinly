"""
Automatically get all video URLs from a TikTok profile
Uses Playwright to browse the profile and extract video links
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from playwright.async_api import async_playwright


async def get_tiktok_video_urls(username: str, max_videos: int = 50):
    """
    Get video URLs from a TikTok profile
    
    Args:
        username: TikTok username (without @)
        max_videos: Maximum number of videos to fetch
    
    Returns:
        List of video URLs
    """
    url = f"https://www.tiktok.com/@{username}"
    video_urls = []
    
    print(f"\nFetching videos from @{username}...")
    print(f"URL: {url}")
    print()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        try:
            # Navigate to profile
            print("Loading TikTok profile...")
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(5000)  # Wait for videos to load
            
            print("Extracting video URLs...")
            
            # Method 1: Try to get from embedded JSON
            try:
                universal_data = await page.evaluate('''() => {
                    const script = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__');
                    if (script) {
                        return JSON.parse(script.textContent);
                    }
                    return null;
                }''')
                
                if universal_data:
                    user_detail = universal_data.get('__DEFAULT_SCOPE__', {}).get('webapp.user-detail', {})
                    item_list = user_detail.get('itemList', [])
                    
                    for item in item_list[:max_videos]:
                        video_id = item.get('id')
                        if video_id:
                            video_url = f"https://www.tiktok.com/@{username}/video/{video_id}"
                            video_urls.append(video_url)
                    
                    print(f"Found {len(video_urls)} videos from JSON data")
            
            except Exception as e:
                print(f"JSON extraction failed: {e}")
            
            # Method 2: Fallback - scrape video elements from page
            if not video_urls:
                print("Trying DOM scraping...")
                await page.wait_for_timeout(2000)
                
                # Find video containers
                video_elements = await page.query_selector_all('[data-e2e="user-post-item"]')
                
                for video_elem in video_elements[:max_videos]:
                    try:
                        link_elem = await video_elem.query_selector('a')
                        if link_elem:
                            href = await link_elem.get_attribute('href')
                            if href and '/video/' in href:
                                # Ensure full URL
                                if not href.startswith('http'):
                                    href = 'https://www.tiktok.com' + href
                                video_urls.append(href)
                    except:
                        pass
                
                print(f"Found {len(video_urls)} videos from DOM")
            
        except Exception as e:
            print(f"Error: {e}")
        
        finally:
            await browser.close()
    
    # Remove duplicates
    video_urls = list(dict.fromkeys(video_urls))
    
    return video_urls


async def main():
    """Main function"""
    
    print("\n" + "="*60)
    print("  TIKTOK VIDEO URL FINDER")
    print("="*60)
    
    # Get username from command line or use default
    if len(sys.argv) > 1:
        username = sys.argv[1].replace('@', '')  # Remove @ if present
    else:
        username = "pepijn.wijn"  # Default
    
    max_videos = 50  # Get up to 50 most recent videos
    
    # Get video URLs
    urls = await get_tiktok_video_urls(username, max_videos)
    
    if urls:
        print()
        print("="*60)
        print(f"  FOUND {len(urls)} VIDEOS")
        print("="*60)
        print()
        
        print("Video URLs:")
        for i, url in enumerate(urls, 1):
            print(f"  {i}. {url}")
        
        print()
        print("="*60)
        print("  NEXT STEPS")
        print("="*60)
        print()
        print("Copy these URLs and add them to:")
        print("  backend/scripts/seed_tiktok_influencers.py")
        print()
        print("Or save to file:")
        print(f"  python scripts/get_tiktok_video_urls.py {username} > videos.txt")
        print()
        
        # Save to file
        output_file = f"tiktok_videos_{username}.txt"
        with open(output_file, 'w') as f:
            for url in urls:
                f.write(url + '\n')
        
        print(f"Saved to: {output_file}")
        print()
        
    else:
        print()
        print("No videos found!")
        print("Possible reasons:")
        print("  - Profile doesn't exist")
        print("  - Profile is private")
        print("  - TikTok blocked the request")
        print("  - Page structure changed")
        print()


if __name__ == "__main__":
    asyncio.run(main())

