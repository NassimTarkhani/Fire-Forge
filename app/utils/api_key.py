"""
API key generation and verification utilities.
"""
import secrets
import hashlib
import bcrypt
from typing import Optional, Tuple
from uuid import UUID


def generate_api_key() -> Tuple[str, str, str]:
    """
    Generate a new API key.
    
    Returns:
        Tuple of (full_key, key_prefix, hashed_key)
    """
    # Generate random key: fg_<32 random hex chars>
    random_part = secrets.token_hex(32)
    full_key = f"fg_{random_part}"
    
    # Store first 12 characters as prefix for identification
    key_prefix = full_key[:12]
    
    # Hash the full key for storage
    hashed_key = hash_api_key(full_key)
    
    return full_key, key_prefix, hashed_key


def hash_api_key(api_key: str) -> str:
    """
    Hash an API key using bcrypt.
    
    Args:
        api_key: The API key to hash
        
    Returns:
        Hashed API key as string
    """
    return bcrypt.hashpw(api_key.encode(), bcrypt.gensalt()).decode()


def verify_api_key_hash(api_key: str, hashed_key: str) -> bool:
    """
    Verify an API key against its hash.
    
    Args:
        api_key: The API key to verify
        hashed_key: The stored hash
        
    Returns:
        True if valid, False otherwise
    """
    try:
        return bcrypt.checkpw(api_key.encode(), hashed_key.encode())
    except Exception:
        return False


def verify_api_key(supabase, api_key: str) -> Optional[Tuple[UUID, UUID]]:
    """
    Verify API key against database.
    
    Args:
        supabase: SupabaseService instance
        api_key: The API key to verify
        
    Returns:
        Tuple of (user_id, api_key_id) if valid, None otherwise
    """
    # Get key prefix for efficient lookup
    key_prefix = api_key[:12]
    
    # Query database for keys with this prefix
    response = supabase.client.table("api_keys").select("*").eq(
        "key_prefix", key_prefix
    ).eq("revoked", False).execute()
    
    if not response.data:
        return None
    
    # Verify hash for each matching key
    for key_data in response.data:
        if verify_api_key_hash(api_key, key_data["hashed_key"]):
            return UUID(key_data["user_id"]), UUID(key_data["id"])
    
    return None
