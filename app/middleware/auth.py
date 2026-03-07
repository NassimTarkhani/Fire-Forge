"""
Authentication middleware for API key validation.
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Tuple
from uuid import UUID
import logging

from app.services.supabase_service import SupabaseService
from app.utils.api_key import verify_api_key
from app.utils.session_token import hash_session_token

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def validate_api_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials
) -> Tuple[UUID, UUID]:
    """
    Validate API key and return user_id and api_key_id.
    
    Args:
        request: FastAPI request object
        credentials: HTTP Authorization credentials
        
    Returns:
        Tuple of (user_id, api_key_id)
        
    Raises:
        HTTPException: If API key is invalid or revoked
    """
    api_key = credentials.credentials
    
    if not api_key or not api_key.startswith("fg_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format"
        )
    
    # Get Supabase service from app state
    supabase: SupabaseService = request.app.state.supabase
    
    # Verify API key (run sync in threadpool)
    from starlette.concurrency import run_in_threadpool
    result = await run_in_threadpool(verify_api_key, supabase, api_key)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key"
        )
    
    user_id, api_key_id = result
    
    # Attach to request state for later use
    request.state.user_id = user_id
    request.state.api_key_id = api_key_id
    
    return user_id, api_key_id


async def validate_request_auth(
    request: Request,
    credentials: HTTPAuthorizationCredentials
) -> Tuple[UUID, Optional[UUID]]:
    """
    Validate either an API key (fg_) or a user session token (ffu_).

    Returns:
        Tuple of (user_id, api_key_id_or_none)
    """
    token = credentials.credentials

    if token and token.startswith("fg_"):
        user_id, api_key_id = await validate_api_key(request, credentials)
        return user_id, api_key_id

    if token and token.startswith("ffu_"):
        user_id = await validate_user_token(request, credentials)
        request.state.user_id = user_id
        request.state.api_key_id = None
        return user_id, None

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid auth token format"
    )


async def validate_admin_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials
) -> bool:
    """
    Validate admin master key or check if user is admin.
    
    Args:
        request: FastAPI request object
        credentials: HTTP Authorization credentials
        
    Returns:
        True if valid admin
        
    Raises:
        HTTPException: If not authorized as admin
    """
    from app.config import get_settings
    
    settings = get_settings()
    api_key = credentials.credentials
    
    # Check if it's the master admin key
    if api_key == settings.admin_master_key:
        return True
    
    # Check if it's a regular API key with admin privileges
    if api_key.startswith("fg_"):
        from starlette.concurrency import run_in_threadpool
        supabase: SupabaseService = request.app.state.supabase
        result = await run_in_threadpool(verify_api_key, supabase, api_key)
        
        if result:
            user_id, _ = result
            # Check if user is admin (get_user is also sync, needs threadpool)
            user = await run_in_threadpool(supabase.get_user, user_id)
            if user and user.get("is_admin"):
                return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin privileges required"
    )


async def validate_user_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials
) -> UUID:
    """
    Validate a user auth token and return the associated user_id.

    This is separate from API-key authentication and is used by the
    email/password auth flow (signup/login/me/logout).
    """
    token = credentials.credentials

    if not token or not token.startswith("ffu_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid auth token format"
        )

    supabase: SupabaseService = request.app.state.supabase
    token_hash = hash_session_token(token)

    from starlette.concurrency import run_in_threadpool
    session = await run_in_threadpool(supabase.get_user_session, token_hash)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired auth token"
        )

    user_id = UUID(session["user_id"])
    request.state.auth_user_id = user_id
    request.state.auth_token_hash = token_hash
    return user_id
