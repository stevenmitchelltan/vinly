from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WineType(str, Enum):
    red = "red"
    white = "white"
    rose = "rose"
    sparkling = "sparkling"


class Supermarket(str, Enum):
    albert_heijn = "Albert Heijn"
    dirk = "Dirk"
    hema = "HEMA"
    lidl = "LIDL"
    jumbo = "Jumbo"
    aldi = "ALDI"
    plus = "Plus"
    sligro = "Sligro"


class Wine(BaseModel):
    name: str
    supermarket: Supermarket
    wine_type: WineType
    image_url: Optional[str] = None  # Legacy - single image
    image_urls: Optional[List[str]] = None  # New - multiple images for carousel
    rating: Optional[str] = None
    influencer_source: str
    post_url: str
    date_found: datetime = Field(default_factory=datetime.utcnow)
    in_stock: Optional[bool] = None
    last_checked: Optional[datetime] = None
    description: Optional[str] = None


class WineResponse(BaseModel):
    id: str
    name: str
    supermarket: str
    wine_type: str
    image_url: Optional[str]  # Legacy
    image_urls: Optional[List[str]]  # New - carousel images
    rating: Optional[str]
    influencer_source: str
    post_url: str
    date_found: datetime
    in_stock: Optional[bool]
    description: Optional[str]


class ProcessedVideo(BaseModel):
    """Track which TikTok videos we've already processed"""
    video_url: str
    tiktok_handle: str
    processed_date: datetime = Field(default_factory=datetime.utcnow)
    wines_found: int = 0
    caption: Optional[str] = None
    is_wine_content: bool = False


class Influencer(BaseModel):
    tiktok_handle: str
    is_active: bool = True
    last_scraped: Optional[datetime] = None
    total_videos_processed: int = 0
    total_wines_found: int = 0


class ScrapeResponse(BaseModel):
    status: str
    message: str
    wines_added: int = 0
