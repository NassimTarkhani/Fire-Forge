"""
Configuration management for the Firecrawl API Gateway.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Firecrawl API Gateway"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Supabase
    supabase_url: str
    supabase_key: str
    
    # Firecrawl
    firecrawl_base_url: str
    firecrawl_timeout: int = 300  # 5 minutes default timeout
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Admin
    admin_master_key: str  # Master key for admin operations

    # User Auth
    auth_session_hours: int = 24
    
    # Polar Payments
    polar_access_token: str = ""
    polar_webhook_secret: str = ""
    polar_organization_id: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
