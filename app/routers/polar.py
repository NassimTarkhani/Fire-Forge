"""
Polar payment routes for handling webhooks and payment management.
"""
from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, List
from uuid import UUID
import logging

from app.models.schemas import (
    PaymentResponse, PaymentFilter, PolarWebhookEvent, SuccessResponse
)
from app.middleware.auth import security, validate_admin_key
from app.services.polar_service import PolarService
from app.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/polar", tags=["polar"])


async def get_services(request: Request):
    """Get services from app state."""
    return (
        request.app.state.supabase,
        request.app.state.polar_service
    )


@router.post("/webhook", status_code=200)
async def polar_webhook(
    request: Request,
    x_polar_signature: Optional[str] = Header(None, alias="X-Polar-Signature")
):
    """
    Handle Polar webhook events.
    
    Supported events:
    - order.paid - Grant credits to user when order is paid
    - order.refunded - Deduct credits from user when refunded
    - checkout.created - Track checkout creation
    - checkout.updated - Track checkout updates
    - subscription.created - Handle new subscription
    - subscription.canceled - Handle subscription cancellation
    """
    # Get raw body for signature verification
    body = await request.body()
    
    supabase, polar_service = await get_services(request)
    
    # Verify webhook signature
    if x_polar_signature:
        if not polar_service.verify_webhook_signature(body, x_polar_signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )
    else:
        logger.warning("No webhook signature provided")
    
    # Parse webhook event
    try:
        event_data = await request.json()
        event_type = event_data.get("type")
        data = event_data.get("data", {})
        
        logger.info(f"Received Polar webhook: {event_type}")
        
        # Process event based on type
        from starlette.concurrency import run_in_threadpool
        
        if event_type == "order.paid":
            # Extract payment details from order
            payment_id = data.get("id")
            amount = data.get("amount", 0)
            currency = data.get("currency", "USD")
            # Polar order.paid includes customer info
            customer_email = data.get("customer_email") or data.get("billing_email") or data.get("email")
            subscription_id = data.get("subscription_id")
            payment_method = data.get("payment_method")
            
            if not payment_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing payment ID"
                )
            
            if not customer_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing customer email"
                )
            
            # Check if payment already exists
            existing = await run_in_threadpool(polar_service.get_payment, payment_id)
            
            if not existing:
                # Create payment record
                created_payment = await run_in_threadpool(
                    polar_service.create_payment,
                    payment_id,
                    amount,
                    currency,
                    customer_email,
                    None,  # user_id will be set when processing
                    subscription_id,
                    payment_method,
                    {"event_type": event_type, "raw_data": data}
                )
                if not created_payment:
                    logger.error(f"Failed to create payment record: {payment_id}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create payment record in database"
                    )
                logger.info(f"Created payment record: {payment_id}")
            else:
                logger.info(f"Payment record already exists: {payment_id}")
            
            # Process payment (grant credits)
            success = await run_in_threadpool(
                polar_service.process_payment_success,
                payment_id,
                customer_email
            )
            
            if not success:
                logger.error(f"Failed to process payment: {payment_id}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to process payment"
                )
            
            logger.info(f"Payment processed successfully: {payment_id}")
        
        elif event_type == "order.refunded":
            # Process refund
            payment_id = data.get("id")
            if payment_id:
                success = await run_in_threadpool(
                    polar_service.process_payment_refund,
                    payment_id
                )
                if success:
                    logger.info(f"Order refunded: {payment_id}")
        
        elif event_type == "checkout.created":
            logger.info(f"Checkout created: {data.get('id')}")
            # Track checkout creation if needed
        
        elif event_type == "checkout.updated":
            logger.info(f"Checkout updated: {data.get('id')}")
            # Track checkout updates if needed
        
        elif event_type == "subscription.created":
            logger.info(f"New subscription created: {data.get('id')}")
            # TODO: Handle subscription logic if needed
        
        elif event_type == "subscription.canceled":
            logger.info(f"Subscription canceled: {data.get('id')}")
            # TODO: Handle subscription cancellation if needed
        
        elif event_type == "subscription.active":
            logger.info(f"Subscription active: {data.get('id')}")
            # TODO: Handle subscription activation if needed
        
        else:
            logger.warning(f"Unhandled webhook event type: {event_type}")
        
        return {"success": True, "message": "Webhook processed"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )


# ===== Admin Endpoints for Payment Management =====

@router.post("/admin/payments", response_model=List[PaymentResponse])
async def list_payments(
    filters: PaymentFilter,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    """
    List payments with optional filters (Admin only).
    """
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    _, polar_service = await get_services(request)
    
    payments = await run_in_threadpool(
        polar_service.list_payments,
        user_id=filters.user_id,
        status=filters.status,
        limit=filters.limit
    )
    
    return payments


@router.get("/admin/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    """
    Get specific payment by Polar payment ID (Admin only).
    """
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    _, polar_service = await get_services(request)
    
    payment = await run_in_threadpool(polar_service.get_payment, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.post("/admin/payments/{payment_id}/reprocess", response_model=SuccessResponse)
async def reprocess_payment(
    payment_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    """
    Manually reprocess a payment (Admin only).
    Useful for failed payments that need to be retried.
    """
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    _, polar_service = await get_services(request)
    
    # Get payment
    payment = await run_in_threadpool(polar_service.get_payment, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Reprocess
    success = await run_in_threadpool(
        polar_service.process_payment_success,
        payment_id,
        payment["customer_email"]
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reprocess payment"
        )
    
    return SuccessResponse(message="Payment reprocessed successfully")


@router.get("/admin/payments/user/{user_id}", response_model=List[PaymentResponse])
async def get_user_payments(
    user_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    """
    Get all payments for a specific user (Admin only).
    """
    from starlette.concurrency import run_in_threadpool
    await validate_admin_key(request, credentials)
    
    _, polar_service = await get_services(request)
    
    payments = await run_in_threadpool(
        polar_service.list_payments,
        user_id=user_id,
        limit=1000
    )
    
    return payments
