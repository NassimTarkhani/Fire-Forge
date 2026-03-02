"""
Admin routes for user management, credit management, and statistics.
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import List
from uuid import UUID

from app.models.schemas import (
    UserCreate, UserUpdate, UserResponse, APIKeyResponse, APIKeyWithSecret, APIKeyCreate,
    CreditBalance, CreditAdd, EndpointPricingCreate, EndpointPricingUpdate,
    EndpointPricingResponse, UsageLogResponse, UsageLogFilter,
    AdminAPIKeyRevoke, AdminStatsResponse, SuccessResponse
)
from app.middleware.auth import security, validate_admin_key
from app.services.supabase_service import SupabaseService
from app.utils.api_key import generate_api_key
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_supabase(request: Request) -> SupabaseService:
    """Get Supabase service from app state."""
    return request.app.state.supabase


# ===== User Management =====

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create a new user (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    # Check if user already exists
    existing = await run_in_threadpool(supabase.get_user_by_email, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user = await run_in_threadpool(supabase.create_user, user_data.email, user_data.is_admin)
    
    # Initialize credits with 0 balance
    await run_in_threadpool(supabase.initialize_credits, UUID(user["id"]), 0)
    
    logger.info(f"Created new user: {user['email']}")
    return user


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """List all users (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    users = await run_in_threadpool(supabase.list_users)
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get a specific user by ID (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    user = await run_in_threadpool(supabase.get_user, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Update a user (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    # Verify user exists
    user = await run_in_threadpool(supabase.get_user, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    updated_user = await run_in_threadpool(
        supabase.update_user,
        user_id,
        user_data.email,
        user_data.is_admin
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    logger.info(f"Updated user {user_id}")
    return updated_user


# ===== API Key Management =====

@router.post("/api-keys", response_model=APIKeyWithSecret)
async def create_api_key(
    key_data: APIKeyCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create a new API key for a user (Admin only)."""
    await validate_admin_key(request, credentials)
    
    # Verify user exists (sync method, run in threadpool)
    from starlette.concurrency import run_in_threadpool
    user = await run_in_threadpool(supabase.get_user, key_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate API key
    full_key, key_prefix, hashed_key = generate_api_key()
    
    # Store in database (sync method, run in threadpool)
    api_key = await run_in_threadpool(supabase.create_api_key, key_data.user_id, key_prefix, hashed_key)
    
    logger.info(f"Created new API key for user {key_data.user_id}")
    
    # Return with full key (only time it's shown)
    return {
        **api_key,
        "api_key": full_key
    }


@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    user_id: UUID = None,
    include_revoked: bool = False,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """List API keys, optionally filtered by user (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    keys = await run_in_threadpool(supabase.list_api_keys, user_id, include_revoked)
    return keys


@router.post("/api-keys/revoke", response_model=SuccessResponse)
async def revoke_api_key(
    revoke_data: AdminAPIKeyRevoke,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Revoke an API key (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    success = await run_in_threadpool(supabase.revoke_api_key, revoke_data.api_key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    logger.info(f"Revoked API key {revoke_data.api_key_id}")
    return SuccessResponse(message="API key revoked successfully")


# ===== Credit Management =====

@router.post("/credits/add", response_model=CreditBalance)
async def add_credits(
    credit_data: CreditAdd,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Add credits to a user's balance (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    # Verify user exists
    user = await run_in_threadpool(supabase.get_user, credit_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    result = await run_in_threadpool(supabase.add_credits, credit_data.user_id, credit_data.amount)
    
    logger.info(f"Added {credit_data.amount} credits to user {credit_data.user_id}")
    return result


@router.get("/credits/{user_id}", response_model=CreditBalance)
async def get_credits(
    user_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get credit balance for a user (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    balance = await run_in_threadpool(supabase.get_credit_balance, user_id)
    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit account not found"
        )
    
    return balance


# ===== Endpoint Pricing =====

@router.post("/pricing", response_model=EndpointPricingResponse)
async def set_endpoint_pricing(
    pricing_data: EndpointPricingCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Set or update pricing for an endpoint (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    result = await run_in_threadpool(supabase.set_endpoint_cost, pricing_data.endpoint, pricing_data.cost)
    
    logger.info(f"Set pricing for {pricing_data.endpoint} to {pricing_data.cost} credits")
    return result


@router.get("/pricing", response_model=List[EndpointPricingResponse])
async def list_endpoint_pricing(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """List all endpoint pricing (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    pricing = await run_in_threadpool(supabase.list_endpoint_pricing)
    return pricing


# ===== Usage Logs =====

@router.post("/usage-logs", response_model=List[UsageLogResponse])
async def get_usage_logs(
    filters: UsageLogFilter,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get usage logs with optional filters (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    logs = await run_in_threadpool(
        supabase.get_usage_logs,
        user_id=filters.user_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
        limit=filters.limit
    )
    return logs


# ===== Statistics =====

@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get overall statistics (Admin only)."""
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    stats = await run_in_threadpool(supabase.get_stats)
    return stats
