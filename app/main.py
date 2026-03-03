"""
FireForge - Main Application
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from app.config import get_settings
from app.services.supabase_service import SupabaseService
from app.services.credit_service import CreditService
from app.services.firecrawl_proxy import FirecrawlProxy
from app.services.polar_service import PolarService
from app.utils.rate_limiter import get_rate_limiter
from app.routers import admin, firecrawl, polar

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("Starting FireForge...")
    
    settings = get_settings()
    
    # Initialize services
    logger.info("Initializing Supabase connection...")
    supabase = SupabaseService(settings.supabase_url, settings.supabase_key)
    
    logger.info("Initializing Credit service...")
    credit_service = CreditService(supabase)
    
    logger.info(f"Initializing Firecrawl proxy to {settings.firecrawl_base_url}...")
    firecrawl_proxy = FirecrawlProxy(
        settings.firecrawl_base_url,
        settings.firecrawl_timeout
    )
    
    logger.info("Initializing rate limiter...")
    rate_limiter = get_rate_limiter(
        settings.rate_limit_requests,
        settings.rate_limit_window
    )
    
    logger.info("Initializing Polar payment service...")
    polar_service = PolarService(
        supabase,
        settings.polar_webhook_secret
    )
    
    # Store in app state
    app.state.supabase = supabase
    app.state.credit_service = credit_service
    app.state.firecrawl_proxy = firecrawl_proxy
    app.state.rate_limiter = rate_limiter
    app.state.polar_service = polar_service
    
    logger.info("FireForge started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FireForge...")
    await firecrawl_proxy.close()
    logger.info("FireForge stopped.")


# Create FastAPI app
app = FastAPI(
    title="FireForge",
    description="Managed API gateway for self-hosted Firecrawl with credit management",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if app.state.supabase else None
        }
    )


# Include routers
app.include_router(admin.router)
app.include_router(firecrawl.router)
app.include_router(polar.router)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "FireForge",
        "version": "1.0.0"
    }


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "service": "FireForge",
        "version": "1.0.0",
        "description": "Managed API gateway for self-hosted Firecrawl",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
