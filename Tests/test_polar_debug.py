"""
Debug script to test Polar payment processing.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.services.supabase_service import SupabaseService
from app.services.polar_service import PolarService

def test_polar_payment():
    """Test the complete payment flow."""
    print("="*60)
    print("Testing Polar Payment Flow")
    print("="*60)
    
    # Initialize services
    settings = get_settings()
    supabase = SupabaseService(settings.supabase_url, settings.supabase_key)
    polar = PolarService(supabase, settings.polar_webhook_secret)
    
    # Test data
    payment_id = "pi_test_debug_001"
    customer_email = "debug@test.com"
    amount = 1000  # $10
    
    print(f"\n1. Testing payment creation...")
    print(f"   Payment ID: {payment_id}")
    print(f"   Email: {customer_email}")
    print(f"   Amount: ${amount/100}")
    
    # Step 1: Check if payments table exists
    print(f"\n2. Checking if payments table exists...")
    try:
        result = supabase.client.table("payments").select("*").limit(1).execute()
        print(f"   ✓ Payments table exists (found {len(result.data)} records)")
    except Exception as e:
        print(f"   ✗ ERROR: Payments table error: {str(e)}")
        print(f"\n   ACTION REQUIRED:")
        print(f"   Run the schema migration in Supabase SQL Editor:")
        print(f"   See Database/schema.sql for the payments table definition")
        return
    
    # Step 2: Create payment record
    print(f"\n3. Creating payment record...")
    try:
        payment = polar.create_payment(
            polar_payment_id=payment_id,
            amount_cents=amount,
            currency="USD",
            customer_email=customer_email,
            payment_method="test"
        )
        if payment:
            print(f"   ✓ Payment created: {payment['id']}")
            print(f"   - Status: {payment['status']}")
            print(f"   - Credits to grant: {payment['credits_granted']}")
        else:
            print(f"   ✗ ERROR: Failed to create payment")
            return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Step 3: Check if user exists
    print(f"\n4. Checking if user exists...")
    try:
        user = supabase.get_user_by_email(customer_email)
        if user:
            print(f"   ✓ User exists: {user['id']}")
        else:
            print(f"   - User does not exist, will be created")
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Step 4: Process payment (grant credits)
    print(f"\n5. Processing payment (granting credits)...")
    try:
        success = polar.process_payment_success(payment_id, customer_email)
        if success:
            print(f"   ✓ Payment processed successfully!")
        else:
            print(f"   ✗ ERROR: Payment processing failed")
            return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 5: Verify user was created/updated
    print(f"\n6. Verifying user...")
    try:
        user = supabase.get_user_by_email(customer_email)
        if user:
            print(f"   ✓ User found: {user['id']}")
            print(f"   - Email: {user['email']}")
            
            # Check credits
            from uuid import UUID
            user_id = UUID(user['id'])
            credits = supabase.get_credit_balance(user_id)
            if credits:
                print(f"   ✓ Credits balance: {credits['balance']}")
            else:
                print(f"   ✗ ERROR: No credit record found")
        else:
            print(f"   ✗ ERROR: User not found after processing")
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 6: Verify payment was updated
    print(f"\n7. Verifying payment status...")
    try:
        final_payment = polar.get_payment(payment_id)
        if final_payment:
            print(f"   ✓ Payment status: {final_payment['status']}")
            print(f"   - User ID: {final_payment.get('user_id', 'Not set')}")
            print(f"   - Credits granted: {final_payment['credits_granted']}")
        else:
            print(f"   ✗ ERROR: Payment not found")
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
    
    print("\n" + "="*60)
    print("Test Complete!")
    print("="*60)

if __name__ == "__main__":
    test_polar_payment()
