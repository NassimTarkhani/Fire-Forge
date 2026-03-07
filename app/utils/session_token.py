"""Session token utilities for user email/password authentication."""
import hashlib
import secrets


def generate_session_token() -> str:
    """Generate a user session token."""
    return f"ffu_{secrets.token_urlsafe(32)}"


def hash_session_token(token: str) -> str:
    """Hash a session token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()
