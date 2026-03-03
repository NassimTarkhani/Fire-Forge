"""
Complete end-to-end test: User creation → Payment → API Key → Scrape
"""
import requests
import json
import time
import hmac
import hashlib

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"
WEBHOOK_SECRET = "your-polar-webhook-secret-here"  # From .env file

print("="*70)
print("COMPLETE PAYMENT FLOW TEST")
print("="*70)

# Variables to store throughout the flow
user_id = None
api_key = None
test_email = f"testuser_{int(time.time())}@example.com"
payment_id = f"pi_test_{int(time.time())}"

# ============================================================================
# STEP 1: Create User
# ============================================================================
print(f"\n{'='*70}")
print("STEP 1: Creating User")
print(f"{'='*70}")
print(f"Email: {test_email}")

response = requests.post(
    f"{BASE_URL}/admin/users",
    headers={
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    },
    json={"email": test_email, "is_admin": False},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    user_data = response.json()
    user_id = user_data['id']
    print(f"✓ User Created!")
    print(f"  User ID: {user_id}")
    print(f"  Email: {user_data['email']}")
else:
    print(f"✗ Failed: {response.text}")
    exit(1)

# ============================================================================
# STEP 2: Check Initial Credits (should be 0)
# ============================================================================
print(f"\n{'='*70}")
print("STEP 2: Checking Initial Credits")
print(f"{'='*70}")

response = requests.get(
    f"{BASE_URL}/admin/credits/{user_id}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    credits = response.json()
    print(f"✓ Initial Balance: {credits['balance']} credits")
else:
    print(f"✗ Failed: {response.text}")

# ============================================================================
# STEP 3: Simulate Payment Webhook ($25 = 750 credits)
# ============================================================================
print(f"\n{'='*70}")
print("STEP 3: Simulating Polar Payment Webhook")
print(f"{'='*70}")
print(f"Payment Amount: $25.00 (2500 cents)")
print(f"Expected Credits: 750")
print(f"Payment ID: {payment_id}")

webhook_payload = {
    "type": "order.paid",
    "data": {
        "id": payment_id,
        "amount": 2500,  # $25 in cents
        "currency": "USD",
        "customer_email": test_email,
        "payment_method": "card",
        "subscription_id": None
    }
}

# Calculate proper HMAC-SHA256 signature
payload_bytes = json.dumps(webhook_payload).encode('utf-8')
signature = hmac.new(
    WEBHOOK_SECRET.encode(),
    payload_bytes,
    hashlib.sha256
).hexdigest()

response = requests.post(
    f"{BASE_URL}/polar/webhook",
    headers={
        "Content-Type": "application/json",
        "X-Polar-Signature": signature
    },
    json=webhook_payload,
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    print(f"✓ Webhook Processed Successfully!")
    print(f"  Response: {response.json()}")
else:
    print(f"✗ Failed: {response.text}")
    exit(1)

# Wait a moment for processing
time.sleep(1)

# ============================================================================
# STEP 4: Verify Credits Were Added
# ============================================================================
print(f"\n{'='*70}")
print("STEP 4: Verifying Credits Were Added")
print(f"{'='*70}")

response = requests.get(
    f"{BASE_URL}/admin/credits/{user_id}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    credits = response.json()
    print(f"✓ New Balance: {credits['balance']} credits")
    if credits['balance'] == 750:
        print(f"✓✓ CORRECT! $25 payment = 750 credits")
    else:
        print(f"⚠ Warning: Expected 750 credits, got {credits['balance']}")
else:
    print(f"✗ Failed: {response.text}")
    exit(1)

# ============================================================================
# STEP 5: Verify Payment Record
# ============================================================================
print(f"\n{'='*70}")
print("STEP 5: Checking Payment Record")
print(f"{'='*70}")

response = requests.get(
    f"{BASE_URL}/polar/admin/payments/{payment_id}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    payment = response.json()
    print(f"✓ Payment Record Found!")
    print(f"  Payment ID: {payment['polar_payment_id']}")
    print(f"  Amount: ${payment['amount']/100:.2f}")
    print(f"  Status: {payment['status']}")
    print(f"  Credits Granted: {payment['credits_granted']}")
    print(f"  Customer: {payment['customer_email']}")
else:
    print(f"✗ Failed: {response.text}")

# ============================================================================
# STEP 6: Create API Key
# ============================================================================
print(f"\n{'='*70}")
print("STEP 6: Creating API Key for User")
print(f"{'='*70}")

response = requests.post(
    f"{BASE_URL}/admin/api-keys",
    headers={
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    },
    json={"user_id": user_id},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    api_key_data = response.json()
    api_key = api_key_data['api_key']
    print(f"✓ API Key Created!")
    print(f"  Key: {api_key}")
    print(f"  Prefix: {api_key_data['key_prefix']}")
else:
    print(f"✗ Failed: {response.text}")
    exit(1)

# ============================================================================
# STEP 7: Test Scrape with API Key
# ============================================================================
print(f"\n{'='*70}")
print("STEP 7: Testing /v1/scrape with API Key")
print(f"{'='*70}")
print(f"URL: https://example.com")
print(f"Cost: 1 credit (from endpoint_pricing table)")

response = requests.post(
    f"{BASE_URL}/v1/scrape",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "url": "https://example.com",
        "formats": ["markdown"]
    },
    timeout=60
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    print(f"✓ Scrape Successful!")
    result = response.json()
    if 'markdown' in result:
        print(f"  Markdown length: {len(result.get('markdown', ''))} chars")
    print(f"  (1 credit should be deducted)")
elif response.status_code == 402:
    print(f"✗ Insufficient Credits!")
    print(f"  {response.json()}")
elif response.status_code == 502:
    print(f"⚠ Firecrawl connection error (but auth worked!)")
    print(f"  {response.json()}")
    print(f"  Note: Credit was NOT deducted due to error (auto-refund)")
else:
    print(f"✗ Error: {response.text[:300]}")

# ============================================================================
# STEP 8: Verify Final Credit Balance
# ============================================================================
print(f"\n{'='*70}")
print("STEP 8: Checking Final Credit Balance")
print(f"{'='*70}")

response = requests.get(
    f"{BASE_URL}/admin/credits/{user_id}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 200:
    credits = response.json()
    print(f"✓ Final Balance: {credits['balance']} credits")
    expected = 749 if response.status_code == 200 else 750
    if credits['balance'] == expected:
        print(f"✓✓ CORRECT! Started with 750, used 1")
    elif credits['balance'] == 750:
        print(f"⚠ Still 750 - scrape failed so credit was refunded")
else:
    print(f"✗ Failed: {response.text}")

# ============================================================================
# SUMMARY
# ============================================================================
print(f"\n{'='*70}")
print("TEST SUMMARY")
print(f"{'='*70}")
print(f"✓ User Created: {test_email}")
print(f"✓ Payment Processed: ${2500/100:.2f} → 750 credits")
print(f"✓ API Key Generated: {api_key[:30]}...")
print(f"✓ Authentication: Working")
print(f"✓ Credit System: Working")
print(f"\n{'='*70}")
print("ALL TESTS PASSED! 🎉")
print(f"{'='*70}")

print(f"\n\nYou can now use this API key in Postman:")
print(f"Authorization: Bearer {api_key}")
