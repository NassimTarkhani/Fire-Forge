"""
Supabase database service for all database operations.
"""
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Service for interacting with Supabase database."""
    
    def __init__(self, url: str, key: str):
        """
        Initialize Supabase client.
        
        Args:
            url: Supabase project URL
            key: Supabase API key
        """
        self.client: Client = create_client(url, key)
    
    # ===== User Operations =====
    
    def create_user(self, email: str, is_admin: bool = False) -> Dict[str, Any]:
        """Create a new user."""
        data = {
            "email": email,
            "is_admin": is_admin
        }
        response = self.client.table("users").insert(data).execute()
        return response.data[0] if response.data else None
    
    def get_user(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        response = self.client.table("users").select("*").eq(
            "id", str(user_id)
        ).execute()
        return response.data[0] if response.data else None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email."""
        response = self.client.table("users").select("*").eq(
            "email", email
        ).execute()
        return response.data[0] if response.data else None
    
    def list_users(self, limit: int = 100) -> List[Dict[str, Any]]:
        """List all users."""
        response = self.client.table("users").select("*").limit(limit).execute()
        return response.data or []
    
    def update_user(self, user_id: UUID, email: Optional[str] = None, is_admin: Optional[bool] = None) -> Optional[Dict[str, Any]]:
        """Update user information."""
        update_data = {}
        if email is not None:
            update_data["email"] = email
        if is_admin is not None:
            update_data["is_admin"] = is_admin
        
        if not update_data:
            # Nothing to update
            return self.get_user(user_id)
        
        response = self.client.table("users").update(update_data).eq(
            "id", str(user_id)
        ).execute()
        return response.data[0] if response.data else None
    
    # ===== API Key Operations =====
    
    def create_api_key(
        self,
        user_id: UUID,
        key_prefix: str,
        hashed_key: str
    ) -> Dict[str, Any]:
        """Create a new API key."""
        data = {
            "user_id": str(user_id),
            "key_prefix": key_prefix,
            "hashed_key": hashed_key,
            "revoked": False
        }
        response = self.client.table("api_keys").insert(data).execute()
        return response.data[0] if response.data else None
    
    def get_api_key(self, api_key_id: UUID) -> Optional[Dict[str, Any]]:
        """Get API key by ID."""
        response = self.client.table("api_keys").select("*").eq(
            "id", str(api_key_id)
        ).execute()
        return response.data[0] if response.data else None
    
    def list_api_keys(
        self,
        user_id: Optional[UUID] = None,
        include_revoked: bool = False
    ) -> List[Dict[str, Any]]:
        """List API keys, optionally filtered by user."""
        query = self.client.table("api_keys").select("*")
        
        if user_id:
            query = query.eq("user_id", str(user_id))
        
        if not include_revoked:
            query = query.eq("revoked", False)
        
        response = query.execute()
        return response.data or []
    
    def revoke_api_key(self, api_key_id: UUID) -> bool:
        """Revoke an API key."""
        response = self.client.table("api_keys").update(
            {"revoked": True}
        ).eq("id", str(api_key_id)).execute()
        return bool(response.data)
    
    # ===== Credit Operations =====
    
    def get_credit_balance(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get credit balance for user."""
        response = self.client.table("credits").select("*").eq(
            "user_id", str(user_id)
        ).execute()
        return response.data[0] if response.data else None
    
    def initialize_credits(self, user_id: UUID, initial_balance: int = 0) -> Dict[str, Any]:
        """Initialize credits for a new user."""
        data = {
            "user_id": str(user_id),
            "balance": initial_balance
        }
        response = self.client.table("credits").insert(data).execute()
        return response.data[0] if response.data else None
    
    def add_credits(self, user_id: UUID, amount: int) -> Optional[Dict[str, Any]]:
        """Add credits to user balance."""
        # Get current balance
        current = self.get_credit_balance(user_id)
        
        if not current:
            # Initialize if doesn't exist
            return self.initialize_credits(user_id, amount)
        
        new_balance = current["balance"] + amount
        response = self.client.table("credits").update({
            "balance": new_balance,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", str(user_id)).execute()
        
        return response.data[0] if response.data else None
    
    def deduct_credits(self, user_id: UUID, amount: int) -> Optional[Dict[str, Any]]:
        """Deduct credits from user balance."""
        # Get current balance
        current = self.get_credit_balance(user_id)
        
        if not current or current["balance"] < amount:
            return None
        
        new_balance = current["balance"] - amount
        response = self.client.table("credits").update({
            "balance": new_balance,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", str(user_id)).execute()
        
        return response.data[0] if response.data else None
    
    # ===== Endpoint Pricing Operations =====
    
    def get_endpoint_cost(self, endpoint: str) -> int:
        """Get cost for an endpoint (default to 1 if not found)."""
        response = self.client.table("endpoint_pricing").select("cost").eq(
            "endpoint", endpoint
        ).execute()
        
        if response.data:
            return response.data[0]["cost"]
        return 1  # Default cost
    
    def set_endpoint_cost(self, endpoint: str, cost: int) -> Dict[str, Any]:
        """Set or update cost for an endpoint."""
        # Try to update first
        response = self.client.table("endpoint_pricing").update({
            "cost": cost,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("endpoint", endpoint).execute()
        
        if not response.data:
            # Insert if doesn't exist
            data = {
                "endpoint": endpoint,
                "cost": cost
            }
            response = self.client.table("endpoint_pricing").insert(data).execute()
        
        return response.data[0] if response.data else None
    
    def list_endpoint_pricing(self) -> List[Dict[str, Any]]:
        """List all endpoint pricing."""
        response = self.client.table("endpoint_pricing").select("*").execute()
        return response.data or []
    
    # ===== Usage Log Operations =====
    
    def log_usage(
        self,
        user_id: UUID,
        api_key_id: UUID,
        endpoint: str,
        credits_used: int,
        status_code: int,
        request_size: Optional[int] = None,
        response_size: Optional[int] = None
    ) -> Dict[str, Any]:
        """Log API usage."""
        data = {
            "user_id": str(user_id),
            "api_key_id": str(api_key_id),
            "endpoint": endpoint,
            "request_size": request_size,
            "response_size": response_size,
            "credits_used": credits_used,
            "status_code": status_code
        }
        response = self.client.table("usage_logs").insert(data).execute()
        return response.data[0] if response.data else None
    
    def get_usage_logs(
        self,
        user_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get usage logs with optional filters."""
        query = self.client.table("usage_logs").select("*")
        
        if user_id:
            query = query.eq("user_id", str(user_id))
        
        if start_date:
            query = query.gte("created_at", start_date.isoformat())
        
        if end_date:
            query = query.lte("created_at", end_date.isoformat())
        
        query = query.order("created_at", desc=True).limit(limit)
        response = query.execute()
        return response.data or []
    
    # ===== Statistics =====
    
    def get_stats(self) -> Dict[str, int]:
        """Get overall statistics."""
        # Count users
        users_response = self.client.table("users").select(
            "*", count="exact"
        ).execute()
        total_users = users_response.count or 0
        
        # Count API keys
        keys_response = self.client.table("api_keys").select(
            "*", count="exact"
        ).execute()
        total_keys = keys_response.count or 0
        
        # Sum of all credits
        credits_response = self.client.table("credits").select("balance").execute()
        total_credits = sum(c["balance"] for c in (credits_response.data or []))
        
        # Count logs
        logs_response = self.client.table("usage_logs").select(
            "*", count="exact"
        ).execute()
        total_requests = logs_response.count or 0
        
        return {
            "total_users": total_users,
            "total_api_keys": total_keys,
            "total_credits_distributed": total_credits,
            "total_requests": total_requests
        }
