"""
In-memory rate limiter implementation.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import asyncio
from uuid import UUID


class RateLimiter:
    """Simple in-memory rate limiter using sliding window."""
    
    def __init__(self, requests: int, window: int):
        """
        Initialize rate limiter.
        
        Args:
            requests: Number of requests allowed per window
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.storage: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def is_allowed(self, identifier: str) -> Tuple[bool, int]:
        """
        Check if request is allowed for identifier.
        
        Args:
            identifier: Unique identifier (e.g., user_id)
            
        Returns:
            Tuple of (allowed: bool, remaining: int)
        """
        async with self._lock:
            now = datetime.utcnow()
            window_start = now - timedelta(seconds=self.window)
            
            # Get request history for this identifier
            request_times = self.storage[identifier]
            
            # Remove requests outside the window
            request_times[:] = [
                req_time for req_time in request_times
                if req_time > window_start
            ]
            
            # Check if under limit
            if len(request_times) < self.requests:
                request_times.append(now)
                remaining = self.requests - len(request_times)
                return True, remaining
            
            return False, 0
    
    async def reset(self, identifier: str):
        """Reset rate limit for identifier."""
        async with self._lock:
            if identifier in self.storage:
                del self.storage[identifier]
    
    async def cleanup_old_entries(self):
        """Cleanup old entries to prevent memory leak."""
        async with self._lock:
            now = datetime.utcnow()
            window_start = now - timedelta(seconds=self.window * 2)
            
            # Remove identifiers with no recent requests
            to_remove = []
            for identifier, request_times in self.storage.items():
                request_times[:] = [
                    req_time for req_time in request_times
                    if req_time > window_start
                ]
                if not request_times:
                    to_remove.append(identifier)
            
            for identifier in to_remove:
                del self.storage[identifier]


# Global rate limiter instance
_rate_limiter: RateLimiter = None


def get_rate_limiter(requests: int = 100, window: int = 60) -> RateLimiter:
    """Get or create global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter(requests, window)
    return _rate_limiter
