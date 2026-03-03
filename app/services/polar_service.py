"""
Polar payment service for handling webhooks and payment processing.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
import logging
import hmac
import hashlib

from app.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)


class PolarService:
    """Service for managing Polar payments and webhooks."""
    
    # Credit packages - map amounts to credits
    CREDIT_PACKAGES = {
        500: 100,      # $5 = 100 credits
        1000: 250,     # $10 = 250 credits
       2500: 750,     # $25 = 750 credits  
        5000: 2000,    # $50 = 2000 credits
        10000: 5000,   # $100 = 5000 credits
    }
    
    def __init__(self, supabase: SupabaseService, webhook_secret: str):
        """
        Initialize Polar service.
        
        Args:
            supabase: SupabaseService instance
            webhook_secret: Polar webhook secret for signature validation
        """
        self.supabase = supabase
        self.webhook_secret = webhook_secret
    
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Polar webhook signature.
        
        Args:
            payload: Raw request body bytes
            signature: Signature from X-Polar-Signature header
            
        Returns:
            True if signature is valid
        """
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured, skipping signature verification")
            return True
        
        try:
            # Compute expected signature
            expected = hmac.new(
                self.webhook_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures (constant time comparison)
            return hmac.compare_digest(signature, expected)
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False
    
    def calculate_credits_for_amount(self, amount_cents: int) -> int:
        """
        Calculate credits to grant for a payment amount.
        
        Args:
            amount_cents: Payment amount in cents
            
        Returns:
            Number of credits to grant
        """
        # Check if exact package match
        if amount_cents in self.CREDIT_PACKAGES:
            return self.CREDIT_PACKAGES[amount_cents]
        
        # Otherwise, calculate based on base rate (1 credit per 5 cents)
        return amount_cents // 5
    
    def create_payment(
        self,
        polar_payment_id: str,
        amount_cents: int,
        currency: str,
        customer_email: str,
        user_id: Optional[UUID] = None,
        polar_subscription_id: Optional[str] = None,
        payment_method: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a payment record in the database.
        
        Args:
            polar_payment_id: Polar payment ID
            amount_cents: Payment amount in cents
            currency: Payment currency
            customer_email: Customer email
            user_id: Optional user ID (if known)
            polar_subscription_id: Optional subscription ID
            payment_method: Payment method used
            metadata: Additional metadata
            
        Returns:
            Created payment record or None
        """
        credits_granted = self.calculate_credits_for_amount(amount_cents)
        
        data = {
            "polar_payment_id": polar_payment_id,
            "amount": amount_cents,
            "currency": currency,
            "credits_granted": credits_granted,
            "status": "pending",
            "customer_email": customer_email,
            "payment_method": payment_method,
            "metadata": metadata
        }
        
        if user_id:
            data["user_id"] = str(user_id)
        
        if polar_subscription_id:
            data["polar_subscription_id"] = polar_subscription_id
        
        try:
            response = self.supabase.client.table("payments").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating payment record: {str(e)}")
            return None
    
    def get_payment(self, polar_payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get payment record by Polar payment ID.
        
        Args:
            polar_payment_id: Polar payment ID
            
        Returns:
            Payment record or None
        """
        try:
            response = self.supabase.client.table("payments").select("*").eq(
                "polar_payment_id", polar_payment_id
            ).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching payment: {str(e)}")
            return None
    
    def update_payment_status(
        self,
        polar_payment_id: str,
        status: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Update payment status.
        
        Args:
            polar_payment_id: Polar payment ID
            status: New status ('completed', 'failed', 'refunded')
            metadata: Additional metadata to merge
            
        Returns:
            Updated payment record or None
        """
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if metadata:
            # Merge metadata
            existing = self.get_payment(polar_payment_id)
            if existing and existing.get("metadata"):
                merged = {**existing["metadata"], **metadata}
                update_data["metadata"] = merged
            else:
                update_data["metadata"] = metadata
        
        try:
            response = self.supabase.client.table("payments").update(update_data).eq(
                "polar_payment_id", polar_payment_id
            ).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating payment status: {str(e)}")
            return None
    
    def process_payment_success(
        self,
        polar_payment_id: str,
        customer_email: str
    ) -> bool:
        """
        Process successful payment - grant credits to user.
        
        Args:
            polar_payment_id: Polar payment ID
            customer_email: Customer email to find/create user
            
        Returns:
            True if credits were granted successfully
        """
        try:
            # Get payment record
            payment = self.get_payment(polar_payment_id)
            if not payment:
                logger.error(f"Payment not found: {polar_payment_id}")
                return False
            
            # Check if already processed
            if payment.get("status") == "completed":
                logger.warning(f"Payment already processed: {polar_payment_id}")
                return True
            
            # Find or create user
            user = self.supabase.get_user_by_email(customer_email)
            if not user:
                logger.info(f"Creating new user for email: {customer_email}")
                user = self.supabase.create_user(customer_email, is_admin=False)
                if not user:
                    logger.error(f"Failed to create user for email: {customer_email}")
                    return False
                
                # Initialize credits
                user_id = UUID(user["id"])
                credit_init = self.supabase.initialize_credits(user_id, 0)
                if not credit_init:
                    logger.error(f"Failed to initialize credits for user {user_id}")
                    return False
                logger.info(f"Initialized credits for new user {user_id}")
            
            user_id = UUID(user["id"])
            credits_to_grant = payment["credits_granted"]
            
            logger.info(f"Attempting to grant {credits_to_grant} credits to user {user_id}")
            
            # Grant credits
            result = self.supabase.add_credits(user_id, credits_to_grant)
            if not result:
                logger.error(f"Failed to add credits to user {user_id}")
                return False
            
            logger.info(f"Successfully added {credits_to_grant} credits to user {user_id}")
            
            # Update payment status
            update_result = self.update_payment_status(
                polar_payment_id,
                "completed",
                {"user_id": str(user_id), "processed_at": datetime.utcnow().isoformat()}
            )
            
            if not update_result:
                logger.warning(f"Failed to update payment status for {polar_payment_id}")
            
            # Update payment user_id if not set
            if not payment.get("user_id"):
                try:
                    self.supabase.client.table("payments").update({
                        "user_id": str(user_id)
                    }).eq("polar_payment_id", polar_payment_id).execute()
                    logger.info(f"Updated payment user_id for {polar_payment_id}")
                except Exception as e:
                    logger.error(f"Error updating payment user_id: {str(e)}")
            
            logger.info(
                f"Payment processed successfully: {polar_payment_id}, "
                f"granted {credits_to_grant} credits to user {user_id} ({customer_email})"
            )
            return True
            
        except Exception as e:
            logger.error(f"Exception in process_payment_success: {str(e)}", exc_info=True)
            return False
    
    def process_payment_refund(self, polar_payment_id: str) -> bool:
        """
        Process payment refund - deduct credits from user.
        
        Args:
            polar_payment_id: Polar payment ID
            
        Returns:
            True if refund was processed successfully
        """
        # Get payment record
        payment = self.get_payment(polar_payment_id)
        if not payment:
            logger.error(f"Payment not found for refund: {polar_payment_id}")
            return False
        
        # Check if already refunded
        if payment.get("status") == "refunded":
            logger.warning(f"Payment already refunded: {polar_payment_id}")
            return True
        
        # Deduct credits if user exists
        if payment.get("user_id"):
            user_id = UUID(payment["user_id"])
            credits_to_deduct = payment["credits_granted"]
            
            # Try to deduct credits
            result = self.supabase.deduct_credits(user_id, credits_to_deduct)
            if not result:
                logger.warning(
                    f"Could not deduct credits from user {user_id} for refund "
                    f"(possibly insufficient balance)"
                )
        
        # Update payment status
        self.update_payment_status(
            polar_payment_id,
            "refunded",
            {"refunded_at": datetime.utcnow().isoformat()}
        )
        
        logger.info(f"Payment refunded: {polar_payment_id}")
        return True
    
    def list_payments(
        self,
        user_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List payments with optional filters.
        
        Args:
            user_id: Filter by user ID
            status: Filter by status
            limit: Maximum results
            
        Returns:
            List of payment records
        """
        try:
            query = self.supabase.client.table("payments").select("*")
            
            if user_id:
                query = query.eq("user_id", str(user_id))
            
            if status:
                query = query.eq("status", status)
            
            query = query.order("created_at", desc=True).limit(limit)
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error listing payments: {str(e)}")
            return []
