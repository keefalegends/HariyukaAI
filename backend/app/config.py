"""
Hariyuka AI - Core Application Configuration.
Pydantic v2 BaseSettings loading from .env with full dual-API & model routing support.
"""
from typing import Optional, List, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Settings
    NODE_ENV: str = "development"
    APP_ENV: str = "development"
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Hariyuka AI"
    
    # ─── Dual AI API Gateways ───
    # API 1 Gateway (e.g. 9Router Proxy or any OpenAI-compatible gateway)
    API_1_BASE_URL: str = "http://localhost:20128/v1"
    API_1_API_KEY: str = "your_api_1_key_here"
    NINEROUTER_BASE_URL: str = "http://localhost:20128/v1"
    NINEROUTER_API_KEY: str = "your_api_1_key_here"

    # API 2 Gateway (e.g. Re:Link Gateway / OpenRouter / custom gateway)
    API_2_BASE_URL: Optional[str] = None
    API_2_API_KEY: Optional[str] = None
    PRIMARY_AI_BASE_URL: Optional[str] = None
    PRIMARY_AI_API_KEY: Optional[str] = None

    # ─── Model Routing Pipeline ───
    # 1. SERP & Outline
    MODEL_SERP_EXTRACTOR: str = "ag/gemini-3.7-flash-high"
    MODEL_OUTLINE_GENERATOR: str = "ag/gemini-3.7-flash-high"
    SERP_PROVIDER: str = "api_1"
    SERP_FALLBACK_ENABLED: bool = True
    SERP_FALLBACK_MODEL: Optional[str] = "gemini-4-argon"
    SERP_FALLBACK_PROVIDER: Optional[str] = "api_2"

    # 2. Section Writer & SEO Polish
    MODEL_SECTION_WRITER: str = "claude-opus-5-5"
    MODEL_SEO_POLISHER: str = "claude-opus-5-5"
    WRITER_PROVIDER: str = "api_2"
    WRITER_FALLBACK_ENABLED: bool = True
    WRITER_FALLBACK_MODEL: Optional[str] = "ag/claude-opus-4-6-thinking"
    WRITER_FALLBACK_PROVIDER: Optional[str] = "api_1"

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
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
