from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    mongodb_uri: str
    openai_api_key: str
    instagram_username: str = ""
    instagram_password: str = ""
    cors_origins: str = "http://localhost:5173"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

