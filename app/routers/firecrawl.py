"""
Firecrawl proxy routes - forwards all requests to Firecrawl instance.
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import Any, Dict
import logging
import asyncio

from app.middleware.auth import security, validate_request_auth
from app.services.supabase_service import SupabaseService
from app.services.credit_service import CreditService
from app.services.firecrawl_proxy import FirecrawlProxy
from app.utils.rate_limiter import get_rate_limiter
from app.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["firecrawl"])


async def get_services(request: Request):
    """Get services from app state."""
    return (
        request.app.state.supabase,
        request.app.state.credit_service,
        request.app.state.firecrawl_proxy,
        request.app.state.rate_limiter
    )


async def process_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials,
    endpoint: str,
    method: str,
    path: str,
    json_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Common request processing logic:
    1. Validate API key
    2. Check rate limit
    3. Check and deduct credits
    4. Proxy to Firecrawl
    5. Log usage
    """
    # Validate API key or authenticated user token
    user_id, api_key_id = await validate_request_auth(request, credentials)
    
    # Get services
    supabase, credit_service, firecrawl_proxy, rate_limiter = await get_services(request)
    
    # Check rate limit
    settings = get_settings()
    if settings.rate_limit_enabled:
        allowed, remaining = await rate_limiter.is_allowed(str(user_id))
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        logger.debug(f"Rate limit check passed for user {user_id}, remaining: {remaining}")
    
    # Check and deduct credits
    success, credits_used, error_msg = await credit_service.check_and_deduct_credits(
        user_id, endpoint
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=error_msg or "Insufficient credits"
        )
    
    # Proxy request to Firecrawl
    try:
        response_data, status_code, request_size, response_size = await firecrawl_proxy.proxy_request(
            method=method,
            path=path,
            headers=dict(request.headers),
            json_data=json_data
        )
        
        # Log usage (sync method, run in threadpool)
        from starlette.concurrency import run_in_threadpool
        await run_in_threadpool(
            supabase.log_usage,
            user_id,
            api_key_id,
            endpoint,
            credits_used,
            status_code,
            request_size,
            response_size
        )
        
        # Return response with original status code
        if status_code >= 400:
            # Refund credits on error
            await credit_service.refund_credits(user_id, credits_used)
            raise HTTPException(status_code=status_code, detail=response_data)
        
        return response_data
        
    except HTTPException:
        # Refund credits on proxy error
        await credit_service.refund_credits(user_id, credits_used)
        raise
    except Exception as e:
        # Refund credits on unexpected error
        await credit_service.refund_credits(user_id, credits_used)
        logger.error(f"Unexpected error processing request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


async def process_batch_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials,
    endpoint_name: str,
    firecrawl_path: str,
    data: Dict[str, Any],
    batch_type: str = "scrape"
) -> Dict[str, Any]:
    """
    Process batch request with polling until completion.
    
    Args:
        request: FastAPI request object
        credentials: Authorization credentials
        endpoint_name: Endpoint name for pricing (e.g., "/v1/batch/scrape")
        firecrawl_path: Firecrawl API path
        data: Request data
        batch_type: Type of batch operation ("scrape" or "crawl")
        
    Returns:
        Complete batch results
    """
    # Submit batch job
    initial_response = await process_request(
        request, credentials, endpoint_name, "POST", firecrawl_path, data
    )
    
    # Extract job ID from response
    if not initial_response.get("success") or not initial_response.get("id"):
        logger.error(f"Batch job submission failed: {initial_response}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit batch {batch_type} job"
        )
    
    job_id = initial_response["id"]
    logger.info(f"Batch {batch_type} job {job_id} submitted, polling for completion...")
    
    # Get services
    supabase, credit_service, firecrawl_proxy, rate_limiter = await get_services(request)
    
    # Poll for completion
    max_attempts = 120  # 10 minutes with 5-second intervals
    poll_interval = 5  # seconds
    
    for attempt in range(max_attempts):
        await asyncio.sleep(poll_interval)
        
        try:
            # Check job status
            status_path = f"/v1/batch/{batch_type}/{job_id}"
            response_data, status_code, _, _ = await firecrawl_proxy.proxy_request(
                "GET",
                status_path,
                headers=None
            )
            
            if status_code != 200:
                logger.warning(f"Status check failed for job {job_id}: {status_code}")
                continue
            
            job_status = response_data.get("status")
            logger.debug(f"Job {job_id} status: {job_status} (attempt {attempt + 1}/{max_attempts})")
            
            # Check if completed
            if job_status == "completed":
                logger.info(f"Batch {batch_type} job {job_id} completed successfully")
                return response_data
            
            # Check if failed
            if job_status in ["failed", "cancelled"]:
                logger.error(f"Batch {batch_type} job {job_id} {job_status}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Batch {batch_type} job {job_status}: {response_data.get('error', 'Unknown error')}"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Error checking status for job {job_id}: {str(e)}")
            continue
    
    # Timeout
    logger.error(f"Batch {batch_type} job {job_id} timed out after {max_attempts * poll_interval} seconds")
    raise HTTPException(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        detail=f"Batch {batch_type} job timed out waiting for completion"
    )


async def process_crawl_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials,
    endpoint_name: str,
    firecrawl_path: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process crawl request with polling until completion.
    
    Args:
        request: FastAPI request object
        credentials: Authorization credentials
        endpoint_name: Endpoint name for pricing (e.g., "/v1/crawl")
        firecrawl_path: Firecrawl API path
        data: Request data
        
    Returns:
        Complete crawl results
    """
    # Submit crawl job
    initial_response = await process_request(
        request, credentials, endpoint_name, "POST", firecrawl_path, data
    )
    
    # Extract job ID from response
    if not initial_response.get("success") or not initial_response.get("id"):
        logger.error(f"Crawl job submission failed: {initial_response}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit crawl job"
        )
    
    job_id = initial_response["id"]
    logger.info(f"Crawl job {job_id} submitted, polling for completion...")
    
    # Get services
    supabase, credit_service, firecrawl_proxy, rate_limiter = await get_services(request)
    
    # Poll for completion
    max_attempts = 240  # 20 minutes with 5-second intervals (crawls take longer)
    poll_interval = 5  # seconds
    
    for attempt in range(max_attempts):
        await asyncio.sleep(poll_interval)
        
        try:
            # Check job status
            status_path = f"/v1/crawl/{job_id}"
            response_data, status_code, _, _ = await firecrawl_proxy.proxy_request(
                "GET",
                status_path,
                headers=None
            )
            
            if status_code != 200:
                logger.warning(f"Status check failed for crawl job {job_id}: {status_code}")
                continue
            
            job_status = response_data.get("status")
            logger.debug(f"Crawl job {job_id} status: {job_status} (attempt {attempt + 1}/{max_attempts})")
            
            # Check if completed
            if job_status == "completed":
                logger.info(f"Crawl job {job_id} completed successfully")
                return response_data
            
            # Check if failed
            if job_status in ["failed", "cancelled"]:
                logger.error(f"Crawl job {job_id} {job_status}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Crawl job {job_status}: {response_data.get('error', 'Unknown error')}"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Error checking status for crawl job {job_id}: {str(e)}")
            continue
    
    # Timeout
    logger.error(f"Crawl job {job_id} timed out after {max_attempts * poll_interval} seconds")
    raise HTTPException(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        detail="Crawl job timed out waiting for completion"
    )


# ===== Firecrawl Endpoints =====

@router.post("/scrape")
async def scrape(
    data: Dict[str, Any],
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Scrape a single URL."""
    return await process_request(
        request, credentials, "/v1/scrape", "POST", "/v1/scrape", data
    )


@router.post("/crawl")
async def crawl(
    data: Dict[str, Any],
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Start a crawl job and wait for completion."""
    return await process_crawl_request(
        request, credentials, "/v1/crawl", "/v1/crawl", data
    )


@router.get("/crawl/{job_id}")
async def get_crawl_status(
    job_id: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get crawl job status."""
    return await process_request(
        request, credentials, f"/v1/crawl/{job_id}", "GET", f"/v1/crawl/{job_id}"
    )


@router.delete("/crawl/{job_id}")
async def cancel_crawl(
    job_id: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cancel a crawl job."""
    return await process_request(
        request, credentials, f"/v1/crawl/{job_id}", "DELETE", f"/v1/crawl/{job_id}"
    )


@router.post("/map")
async def map_site(
    data: Dict[str, Any],
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Map a website."""
    return await process_request(
        request, credentials, "/v1/map", "POST", "/v1/map", data
    )


@router.post("/search")
async def search(
    data: Dict[str, Any],
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Search functionality."""
    return await process_request(
        request, credentials, "/v1/search", "POST", "/v1/search", data
    )


# Note: /extract endpoint may not be fully supported by Firecrawl v0.x
# The endpoint exists but may return errors like "Failed to parse URL from /responses"
# Uncomment and test when your Firecrawl instance fully supports this endpoint
# @router.post("/extract")
# async def extract(
#     data: Dict[str, Any],
#     request: Request,
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """Extract data from URLs."""
#     return await process_request(
#         request, credentials, "/v1/extract", "POST", "/v1/extract", data
#     )


@router.post("/batch/scrape")
async def batch_scrape(
    data: Dict[str, Any],
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Batch scrape multiple URLs and return complete results."""
    return await process_batch_request(
        request, credentials, "/v1/batch/scrape", "/v1/batch/scrape", data, "scrape"
    )


# Note: /batch/crawl endpoint is not supported by Firecrawl v0.x
# Uncomment when your Firecrawl instance is upgraded to support this endpoint
# @router.post("/batch/crawl")
# async def batch_crawl(
#     data: Dict[str, Any],
#     request: Request,
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """Batch crawl multiple URLs and return complete results."""
#     return await process_batch_request(
#         request, credentials, "/v1/batch/crawl", "/v1/batch/crawl", data, "crawl"
#     )
