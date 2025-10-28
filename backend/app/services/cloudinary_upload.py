"""
Cloudinary image upload service for wine images.
Uploads extracted wine bottle images to Cloudinary CDN for fast, scalable delivery.
"""
import cloudinary
import cloudinary.uploader
from pathlib import Path
from typing import Optional
import os


def configure_cloudinary():
    """
    Configure Cloudinary with credentials from environment variables.
    
    Supports two formats:
    1. CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME (recommended, simpler)
    2. Individual vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    """
    # Check if CLOUDINARY_URL is set (simpler format)
    cloudinary_url = os.getenv('CLOUDINARY_URL')
    
    if cloudinary_url:
        # Cloudinary SDK automatically parses CLOUDINARY_URL
        # Just need to set it in the environment
        cloudinary.config()
    else:
        # Fall back to individual environment variables
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
            api_key=os.getenv('CLOUDINARY_API_KEY', ''),
            api_secret=os.getenv('CLOUDINARY_API_SECRET', '')
        )


def upload_wine_image(image_path: Path, wine_id: str, index: int) -> Optional[str]:
    """
    Upload wine image to Cloudinary and return public URL.
    
    Args:
        image_path: Path to local image file
        wine_id: Unique wine identifier
        index: Image index for this wine (0, 1, 2, etc.)
    
    Returns:
        Secure HTTPS URL to the uploaded image on Cloudinary CDN
        Returns None if upload fails
    """
    try:
        configure_cloudinary()
        
        # Upload to Cloudinary with organized public_id
        result = cloudinary.uploader.upload(
            str(image_path),
            public_id=f"wines/{wine_id}_{index}",
            folder="vinly",
            overwrite=True,
            resource_type="image",
            # Optimize images
            quality="auto",
            fetch_format="auto"
        )
        
        return result['secure_url']
    
    except Exception as e:
        print(f"Error uploading {image_path} to Cloudinary: {e}")
        return None

