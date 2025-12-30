"""
AI Story Backend - Configuration Module
"""
import secrets
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore"
    )
    
    # Application
    app_name: str = "AI Story Creator"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"
    
    # Database
    database_url: str = "sqlite:///./ai_story.db"
    
    # Security
    secret_key: str = secrets.token_urlsafe(32)
    
    # AI Settings
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    ai_rate_limit_per_minute: int = 10


settings = Settings()
