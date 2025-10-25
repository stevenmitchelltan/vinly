from fastapi import APIRouter, BackgroundTasks
from ..models import ScrapeResponse
from ..jobs.daily_scraper import run_scraping_job

router = APIRouter()


@router.post("/trigger-scrape", response_model=ScrapeResponse)
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Manually trigger the scraping job"""
    background_tasks.add_task(run_scraping_job)
    return ScrapeResponse(
        status="started",
        message="Scraping job has been triggered in the background"
    )

