"""
FastAPI dependency injection helpers.
"""
from fastapi import Request

from app.services.supabase_service import SupabaseService
from app.services.credit_service import CreditService
from app.services.firecrawl_proxy import FirecrawlProxy
from app.utils.rate_limiter import RateLimiter


async def get_supabase(request: Request) -> SupabaseService:
    """Get Supabase service from app state."""
    return request.app.state.supabase


async def get_credit_service(request: Request) -> CreditService:
    """Get Credit service from app state."""
    return request.app.state.credit_service


async def get_firecrawl_proxy(request: Request) -> FirecrawlProxy:
    """Get Firecrawl proxy from app state."""
    return request.app.state.firecrawl_proxy


async def get_rate_limiter(request: Request) -> RateLimiter:
    """Get rate limiter from app state."""
    return request.app.state.rate_limiter
