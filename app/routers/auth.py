"""
Authentication and registration routes.
"""
from fastapi import APIRouter, Request, HTTPException, status, Depends
from uuid import UUID
import logging

from app.models.schemas import UserRegister, RegistrationResponse
from app.services.supabase_service import SupabaseService
from app.utils.api_key import generate_api_key

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])


def get_supabase(request: Request) -> SupabaseService:
    """Get Supabase service from app state."""
    return request.app.state.supabase


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegister,
    request: Request,
    supabase: SupabaseService = Depends(get_supabase)
):
    """
    Register a new user account.
    
    Creates a new user, generates an API key, and grants 50 free credits.
    The API key is only shown once - make sure to save it!
    
    Returns:
        - user_id: UUID of the created user
        - api_key: Generated API key (fireforge_...)
        - credits: Number of free credits granted (50)
        - email: User's email address
        - name: User's name
    """
    from starlette.concurrency import run_in_threadpool
    
    try:
        # Check if user already exists
        existing = await run_in_threadpool(supabase.get_user_by_email, user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )
        
        # Create user (not an admin)
        user = await run_in_threadpool(
            supabase.create_user, 
            user_data.email, 
            user_data.name,
            False  # is_admin
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        user_id = UUID(user["id"])
        
        # Generate API key
        full_key, key_prefix, hashed_key = generate_api_key()
        
        # Store API key in database
        api_key_response = await run_in_threadpool(
            supabase.create_api_key,
            user_id,
            key_prefix,
            hashed_key
        )
        
        if not api_key_response:
            # Rollback: delete the user if API key creation fails
            # Note: In production, consider using database transactions
            logger.error(f"Failed to create API key for user {user_id}, user created but key failed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate API key"
            )
        
        # Initialize credits with 50 free credits
        initial_credits = 50
        await run_in_threadpool(supabase.initialize_credits, user_id, initial_credits)
        
        logger.info(f"New user registered: {user_data.email} with {initial_credits} free credits")
        
        return RegistrationResponse(
            user_id=user_id,
            api_key=full_key,
            credits=initial_credits,
            email=user["email"],
            name=user.get("name", "")
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )
