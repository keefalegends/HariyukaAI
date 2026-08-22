import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseModel as BaseSettings
    SettingsConfigDict = dict


class Settings(BaseSettings):
    # App Settings
    APP_ENV: str = "development"
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Hariyuka AI"
    
    # 9Router AI Proxy Settings
    NINEROUTER_BASE_URL: str = "http://localhost:20128/v1"
    NINEROUTER_API_KEY: str = "your_9router_api_key_here"
    
    # Default Models (ag/ alias prefix)
    MODEL_SERP_EXTRACTOR: str = "ag/gemini-3.7-flash-high"
    MODEL_OUTLINE_GENERATOR: str = "ag/gemini-3.7-flash-high"
    MODEL_SECTION_WRITER: str = "ag/claude-sonnet-4-6"
    MODEL_SEO_POLISHER: str = "ag/claude-sonnet-4-6"

    # Supabase Settings
    NEXT_PUBLIC_SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Search / Scraping APIs (Optional)
    SERPER_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
