"""
Credit management service.
"""
from uuid import UUID
from typing import Optional
import logging

from app.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)


class CreditService:
    """Service for managing user credits."""
    
    def __init__(self, supabase: SupabaseService):
        """
        Initialize credit service.
        
        Args:
            supabase: SupabaseService instance
        """
        self.supabase = supabase
    
    async def check_and_deduct_credits(
        self,
        user_id: UUID,
        endpoint: str
    ) -> tuple[bool, int, Optional[str]]:
        """
        Check if user has sufficient credits and deduct if available.
        
        Args:
            user_id: User ID
            endpoint: Endpoint being accessed
            
        Returns:
            Tuple of (success, credits_used, error_message)
        """
        from starlette.concurrency import run_in_threadpool
        # Get endpoint cost (sync method)
        cost = await run_in_threadpool(self.supabase.get_endpoint_cost, endpoint)
        # Get user's credit balance (sync method)
        balance = await run_in_threadpool(self.supabase.get_credit_balance, user_id)
        
        if not balance:
            return False, cost, "Credit account not found"
        
        if balance["balance"] < cost:
            return False, cost, f"Insufficient credits. Required: {cost}, Available: {balance['balance']}"
        
        # Deduct credits (sync method)
        result = await run_in_threadpool(self.supabase.deduct_credits, user_id, cost)
        
        if not result:
            return False, cost, "Failed to deduct credits"
        
        logger.info(f"Deducted {cost} credits from user {user_id} for endpoint {endpoint}")
        return True, cost, None
    
    async def refund_credits(self, user_id: UUID, amount: int) -> bool:
        """
        Refund credits to user (e.g., on request failure).
        
        Args:
            user_id: User ID
            amount: Amount to refund
            
        Returns:
            True if successful
        """
        from starlette.concurrency import run_in_threadpool
        result = await run_in_threadpool(self.supabase.add_credits, user_id, amount)
        if result:
            logger.info(f"Refunded {amount} credits to user {user_id}")
            return True
        return False
