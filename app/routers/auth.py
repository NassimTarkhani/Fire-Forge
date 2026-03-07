"""Authentication routes for email/password signup and login."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import List
import logging

from app.config import get_settings
from app.middleware.auth import security, validate_user_token
from app.models.schemas import (
    UserRegister,
    UserLogin,
    AuthResponse,
    AuthUserResponse,
    APIKeyResponse,
    APIKeyWithSecret,
    UserAPIKeyRevoke,
    SuccessResponse,
)
from app.services.supabase_service import SupabaseService
from app.utils.api_key import generate_api_key
from app.utils.password import hash_password, verify_password
from app.utils.session_token import generate_session_token, hash_session_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])


def get_supabase(request: Request) -> SupabaseService:
    """Get Supabase service from app state."""
    return request.app.state.supabase


def _build_auth_response(user: dict, credits: int, token: str, expires_in: int) -> AuthResponse:
    """Build a normalized auth response payload."""
    return AuthResponse(
        access_token=token,
        expires_in=expires_in,
        credits=credits,
        user=AuthUserResponse(
            id=user["id"],
            email=user["email"],
            name=user.get("name"),
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
    )


@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserRegister,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create a user using email/password and grant 50 free credits."""
    from starlette.concurrency import run_in_threadpool

    existing = await run_in_threadpool(supabase.get_user_by_email, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    password_hash = hash_password(user_data.password)
    user = await run_in_threadpool(
        supabase.create_user,
        user_data.email,
        user_data.name,
        False,
        password_hash
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

    user_id = user["id"]

    # New users receive 50 free credits.
    free_credits = 50
    await run_in_threadpool(supabase.initialize_credits, user_id, free_credits)

    settings = get_settings()
    expires_in = int(getattr(settings, "auth_session_hours", 24)) * 3600
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    token = generate_session_token()
    token_hash = hash_session_token(token)

    session = await run_in_threadpool(
        supabase.create_user_session,
        user_id,
        token_hash,
        expires_at
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create auth session"
        )

    logger.info(f"User signed up: {user_data.email}")
    return _build_auth_response(user, free_credits, token, expires_in)


# Keep /register for backward compatibility, but use email/password auth.
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Alias for /auth/signup."""
    return await signup(user_data, supabase)


@router.post("/auth/login", response_model=AuthResponse)
async def login(
    login_data: UserLogin,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Authenticate user using email/password and issue bearer token."""
    from starlette.concurrency import run_in_threadpool

    user = await run_in_threadpool(supabase.get_user_by_email, login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    stored_password_hash = user.get("password_hash")
    if not stored_password_hash or not verify_password(login_data.password, stored_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    balance = await run_in_threadpool(supabase.get_credit_balance, user["id"])
    credits = balance["balance"] if balance else 0

    settings = get_settings()
    expires_in = int(getattr(settings, "auth_session_hours", 24)) * 3600
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    token = generate_session_token()
    token_hash = hash_session_token(token)

    session = await run_in_threadpool(
        supabase.create_user_session,
        user["id"],
        token_hash,
        expires_at
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create auth session"
        )

    logger.info(f"User logged in: {login_data.email}")
    return _build_auth_response(user, credits, token, expires_in)


@router.get("/auth/me", response_model=AuthUserResponse)
async def me(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseService = Depends(get_supabase)
):
    """Return the current authenticated email/password user."""
    from starlette.concurrency import run_in_threadpool

    user_id = await validate_user_token(request, credentials)
    user = await run_in_threadpool(supabase.get_user, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return AuthUserResponse(
        id=user["id"],
        email=user["email"],
        name=user.get("name"),
        is_admin=user.get("is_admin", False),
        created_at=user["created_at"]
    )


@router.post("/auth/logout", response_model=SuccessResponse)
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseService = Depends(get_supabase)
):
    """Revoke the current user auth session token."""
    from starlette.concurrency import run_in_threadpool

    await validate_user_token(request, credentials)
    token_hash = request.state.auth_token_hash

    await run_in_threadpool(supabase.revoke_user_session, token_hash)

    return SuccessResponse(message="Logged out successfully")


@router.post("/auth/api-keys", response_model=APIKeyWithSecret)
async def create_user_api_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create an API key for the currently authenticated user."""
    from starlette.concurrency import run_in_threadpool

    user_id = await validate_user_token(request, credentials)

    full_key, key_prefix, hashed_key = generate_api_key()
    api_key = await run_in_threadpool(
        supabase.create_api_key,
        user_id,
        key_prefix,
        hashed_key,
    )

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key",
        )

    return {
        **api_key,
        "api_key": full_key,
    }


@router.get("/auth/api-keys", response_model=List[APIKeyResponse])
async def list_user_api_keys(
    request: Request,
    include_revoked: bool = False,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseService = Depends(get_supabase)
):
    """List API keys for the currently authenticated user."""
    from starlette.concurrency import run_in_threadpool

    user_id = await validate_user_token(request, credentials)
    return await run_in_threadpool(supabase.list_api_keys, user_id, include_revoked)


@router.post("/auth/api-keys/revoke", response_model=SuccessResponse)
async def revoke_user_api_key(
    revoke_data: UserAPIKeyRevoke,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseService = Depends(get_supabase)
):
    """Revoke an API key owned by the currently authenticated user."""
    from starlette.concurrency import run_in_threadpool

    user_id = await validate_user_token(request, credentials)
    revoked = await run_in_threadpool(
        supabase.revoke_api_key_for_user,
        revoke_data.api_key_id,
        user_id,
    )

    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )

    return SuccessResponse(message="API key revoked successfully")
