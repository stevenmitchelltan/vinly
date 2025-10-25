"""
Get ALL video URLs from a TikTok profile using infinite scrolling
This gets every video, not just the first 36
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from playwright.async_api import async_playwright


async def get_all_tiktok_videos(username: str):
    """
    Get ALL video URLs from TikTok profile using scrolling
    
    Args:
        username: TikTok username (without @)
    
    Returns:
        List of all video URLs
    """
    url = f"https://www.tiktok.com/@{username}"
    video_urls = set()  # Use set to avoid duplicates
    
    print(f"\nGetting ALL videos from @{username}...")
    print(f"URL: {url}")
    print()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # headless=False to see progress
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        try:
            print("Loading TikTok profile...")
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Get initial videos
            previous_count = 0
            no_new_videos_count = 0
            max_scrolls = 100  # Safety limit
            
            print("Scrolling to load all videos...")
            print("(This may take a few minutes for profiles with many videos)")
            print()
            
            for scroll_num in range(max_scrolls):
                # Extract video links from current page
                video_elements = await page.query_selector_all('[data-e2e="user-post-item"] a')
                
                for elem in video_elements:
                    try:
                        href = await elem.get_attribute('href')
                        if href and '/video/' in href:
                            if not href.startswith('http'):
                                href = 'https://www.tiktok.com' + href
                            video_urls.add(href)
                    except:
                        pass
                
                current_count = len(video_urls)
                
                # Check if we found new videos
                if current_count == previous_count:
                    no_new_videos_count += 1
                    if no_new_videos_count >= 3:
                        print(f"\nNo new videos found after 3 scrolls. Reached end!")
                        break
                else:
                    no_new_videos_count = 0
                    print(f"Found {current_count} videos (scroll {scroll_num + 1})...")
                
                previous_count = current_count
                
                # Scroll down
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await page.wait_for_timeout(2000)  # Wait for new videos to load
            
            print(f"\nTotal videos found: {len(video_urls)}")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()
    
    return list(video_urls)


async def main():
    """Main function"""
    
    print("\n" + "="*60)
    print("  GET ALL TIKTOK VIDEO URLS")
    print("="*60)
    
    if len(sys.argv) > 1:
        username = sys.argv[1].replace('@', '')
    else:
        username = "pepijn.wijn"
    
    # Get all videos
    urls = await get_all_tiktok_videos(username)
    
    if urls:
        print()
        print("="*60)
        print(f"  FOUND {len(urls)} TOTAL VIDEOS")
        print("="*60)
        print()
        
        # Save to file
        output_file = f"all_tiktok_videos_{username}.txt"
        with open(output_file, 'w') as f:
            for url in urls:
                f.write(url + '\n')
        
        print(f"Saved to: {output_file}")
        print()
        print("Preview (first 10):")
        for i, url in enumerate(list(urls)[:10], 1):
            print(f"  {i}. {url}")
        
        if len(urls) > 10:
            print(f"  ... and {len(urls) - 10} more")
        
        print()
        print("Use this file with the automated scraper!")
        print()
    else:
        print("\nNo videos found!")


if __name__ == "__main__":
    asyncio.run(main())

