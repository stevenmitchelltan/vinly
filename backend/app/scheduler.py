from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from .jobs.daily_scraper import run_scraping_job_sync

scheduler = None


def start_scheduler():
    """Start the background scheduler"""
    global scheduler
    
    scheduler = BackgroundScheduler()
    
    # Schedule daily scraping at 6 AM
    scheduler.add_job(
        run_scraping_job_sync,
        CronTrigger(hour=6, minute=0),
        id='daily_scraping_job',
        name='Daily wine scraping from Instagram',
        replace_existing=True
    )
    
    scheduler.start()
    print("Scheduler started - daily scraping job scheduled for 6:00 AM")


def shutdown_scheduler():
    """Shutdown the scheduler"""
    global scheduler
    
    if scheduler:
        scheduler.shutdown()
        print("Scheduler shut down")

