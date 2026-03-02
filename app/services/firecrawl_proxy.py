"""
Firecrawl proxy service for forwarding requests to Firecrawl instance.
"""
import httpx
from typing import Any, Dict, Optional
import logging
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


class FirecrawlProxy:
    """Proxy service for Firecrawl API calls."""
    
    def __init__(self, base_url: str, timeout: int = 300):
        """
        Initialize Firecrawl proxy.
        
        Args:
            base_url: Base URL of Firecrawl instance
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout),
            follow_redirects=True
        )
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def proxy_request(
        self,
        method: str,
        path: str,
        headers: Optional[Dict[str, str]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        query_params: Optional[Dict[str, Any]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """
        Forward request to Firecrawl instance.
        
        Args:
            method: HTTP method (GET, POST, DELETE, etc.)
            path: API path (e.g., /v1/scrape)
            headers: Optional headers to forward
            json_data: Optional JSON body
            query_params: Optional query parameters
            
        Returns:
            Tuple of (response_data, status_code, request_size, response_size)
            
        Raises:
            HTTPException: If request fails
        """
        url = f"{self.base_url}{path}"
        
        # Prepare headers (exclude authorization from forwarding)
        forward_headers = {}
        if headers:
            # Filter out authorization and host headers
            excluded_headers = {"authorization", "host", "content-length"}
            forward_headers = {
                k: v for k, v in headers.items()
                if k.lower() not in excluded_headers
            }
        
        # Calculate request size
        request_size = 0
        if json_data:
            import json
            request_size = len(json.dumps(json_data).encode('utf-8'))
        
        try:
            logger.info(f"Proxying {method} request to {url}")
            
            response = await self.client.request(
                method=method,
                url=url,
                headers=forward_headers,
                json=json_data,
                params=query_params
            )
            
            # Calculate response size
            response_size = len(response.content)
            
            # Try to parse as JSON, fallback to text
            try:
                response_data = response.json()
            except Exception:
                response_data = {"text": response.text}
            
            # If Firecrawl returns an error status, we still return it
            # (don't raise exception, let client handle it)
            return response_data, response.status_code, request_size, response_size
            
        except httpx.TimeoutException:
            logger.error(f"Timeout while proxying to {url}")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request to Firecrawl instance timed out"
            )
        except httpx.RequestError as e:
            logger.error(f"Error proxying to {url}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error communicating with Firecrawl instance: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error proxying to {url}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error while proxying request"
            )
    
    # ===== Convenience methods for specific Firecrawl endpoints =====
    
    async def scrape(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/scrape endpoint."""
        return await self.proxy_request("POST", "/v1/scrape", headers, data)
    
    async def crawl(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/crawl endpoint."""
        return await self.proxy_request("POST", "/v1/crawl", headers, data)
    
    async def get_crawl_status(
        self,
        job_id: str,
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to GET /v1/crawl/{jobId} endpoint."""
        return await self.proxy_request("GET", f"/v1/crawl/{job_id}", headers)
    
    async def cancel_crawl(
        self,
        job_id: str,
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to DELETE /v1/crawl/{jobId} endpoint."""
        return await self.proxy_request("DELETE", f"/v1/crawl/{job_id}", headers)
    
    async def map_site(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/map endpoint."""
        return await self.proxy_request("POST", "/v1/map", headers, data)
    
    async def search(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/search endpoint."""
        return await self.proxy_request("POST", "/v1/search", headers, data)
    
    async def extract(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/extract endpoint."""
        return await self.proxy_request("POST", "/v1/extract", headers, data)
    
    async def batch_scrape(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/batch/scrape endpoint."""
        return await self.proxy_request("POST", "/v1/batch/scrape", headers, data)
    
    async def batch_crawl(
        self,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> tuple[Dict[str, Any], int, int, int]:
        """Proxy to /v1/batch/crawl endpoint."""
        return await self.proxy_request("POST", "/v1/batch/crawl", headers, data)
