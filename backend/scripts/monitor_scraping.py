"""
Real-time monitoring of scraping activity
Run this to see live updates while scraping
"""
import requests
import time
import os
from datetime import datetime


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def monitor_scraping(api_url="http://localhost:8000"):
    """Monitor scraping status in real-time"""
    
    print("="*60)
    print("  VINLY SCRAPING MONITOR")
    print("  Press Ctrl+C to stop")
    print("="*60)
    print()
    
    last_wine_count = 0
    
    try:
        while True:
            try:
                # Get status
                response = requests.get(f"{api_url}/api/status", timeout=2)
                data = response.json()
                
                # Clear and redraw
                clear_screen()
                
                print("="*60)
                print(f"  VINLY SCRAPING MONITOR - {datetime.now().strftime('%H:%M:%S')}")
                print("="*60)
                print()
                
                # Database stats
                db_stats = data.get('database', {})
                print(f"DATABASE STATS:")
                print(f"  Total Wines:  {db_stats.get('total_wines', 0)}")
                print(f"  Real Wines:   {db_stats.get('real_wines', 0)} (from Instagram)")
                print(f"  Test Wines:   {db_stats.get('test_wines', 0)}")
                print()
                
                # Scraping status
                scraping = data.get('scraping', {})
                is_running = scraping.get('is_running', False)
                status_icon = "[RUNNING]" if is_running else "[IDLE]   "
                
                print(f"SCRAPING STATUS: {status_icon}")
                if scraping.get('current_influencer'):
                    print(f"  Current: @{scraping.get('current_influencer')}")
                if scraping.get('status_message'):
                    print(f"  Status:  {scraping.get('status_message')}")
                if scraping.get('wines_found', 0) > 0:
                    print(f"  Found:   {scraping.get('wines_found')} wines this session")
                print()
                
                # Recent wines
                recent = data.get('recent_wines', [])
                if recent:
                    print("RECENT WINES:")
                    for wine in recent[:5]:
                        influencer = wine.get('influencer', 'unknown')
                        marker = "[TEST]" if influencer == "test_data" else "[REAL]"
                        print(f"  {marker} {wine.get('name')} - {wine.get('supermarket')}")
                        print(f"         from @{influencer}")
                    print()
                
                # Check for new wines
                current_count = db_stats.get('real_wines', 0)
                if current_count > last_wine_count:
                    new_wines = current_count - last_wine_count
                    print(f"*** {new_wines} NEW WINE(S) ADDED! ***")
                    print()
                    last_wine_count = current_count
                elif last_wine_count == 0:
                    last_wine_count = current_count
                
                print("-"*60)
                print("Refreshing every 3 seconds... (Ctrl+C to stop)")
                
            except requests.exceptions.ConnectionError:
                print("ERROR: Cannot connect to backend at", api_url)
                print("Make sure the backend is running!")
                time.sleep(5)
            except Exception as e:
                print(f"ERROR: {e}")
                time.sleep(3)
            
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n\nMonitoring stopped.")
        print(f"Final count: {last_wine_count} real wines")


if __name__ == "__main__":
    monitor_scraping()

