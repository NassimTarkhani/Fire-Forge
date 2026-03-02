"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    is_admin: bool = False


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_admin: Optional[bool] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    is_admin: bool
    created_at: datetime


# API Key Schemas
class APIKeyCreate(BaseModel):
    user_id: UUID


class APIKeyResponse(BaseModel):
    id: UUID
    user_id: UUID
    key_prefix: str
    revoked: bool
    created_at: datetime


class APIKeyWithSecret(BaseModel):
    """Response when creating a new API key (includes the full key once)."""
    id: UUID
    user_id: UUID
    key_prefix: str
    api_key: str  # Full key, only shown once
    created_at: datetime


# Credit Schemas
class CreditBalance(BaseModel):
    user_id: UUID
    balance: int
    updated_at: datetime


class CreditAdd(BaseModel):
    user_id: UUID
    amount: int = Field(..., gt=0, description="Amount of credits to add")


class CreditDeduct(BaseModel):
    user_id: UUID
    amount: int = Field(..., gt=0, description="Amount of credits to deduct")


# Endpoint Pricing Schemas
class EndpointPricingCreate(BaseModel):
    endpoint: str
    cost: int = Field(..., ge=0, description="Cost in credits")


class EndpointPricingUpdate(BaseModel):
    cost: int = Field(..., ge=0, description="Cost in credits")


class EndpointPricingResponse(BaseModel):
    id: UUID
    endpoint: str
    cost: int
    created_at: datetime
    updated_at: datetime


# Usage Log Schemas
class UsageLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    api_key_id: Optional[UUID]
    endpoint: str
    request_size: Optional[int]
    response_size: Optional[int]
    credits_used: int
    status_code: int
    created_at: datetime


class UsageLogFilter(BaseModel):
    user_id: Optional[UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)


# Admin Schemas
class AdminAPIKeyRevoke(BaseModel):
    api_key_id: UUID


class AdminStatsResponse(BaseModel):
    total_users: int
    total_api_keys: int
    total_credits_distributed: int
    total_requests: int


# General Response Schemas
class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
