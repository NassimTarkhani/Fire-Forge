"""
Check if real payment worked - find user by email
"""
import requests
import sys

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"

if len(sys.argv) < 2:
    print("Usage: python check_payment_by_email.py your-email@example.com")
    sys.exit(1)

email = sys.argv[1]

print("="*70)
print(f"CHECKING PAYMENT FOR: {email}")
print("="*70)

# Get user by email via admin endpoint
response = requests.post(
    f"{BASE_URL}/admin/users",
    headers={
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    },
    json={"limit": 100},
    timeout=10
)

if response.status_code == 200:
    users = response.json()
    user = next((u for u in users if u['email'] == email), None)
    
    if user:
        user_id = user['id']
        print(f"\n✓ User found:")
        print(f"  User ID: {user_id}")
        print(f"  Email: {user['email']}")
        
        # Check credits
        response = requests.get(
            f"{BASE_URL}/admin/credits/{user_id}",
            headers={"Authorization": f"Bearer {ADMIN_KEY}"},
            timeout=10
        )
        
        if response.status_code == 200:
            credits = response.json()
            print(f"\n✓ Credits:")
            print(f"  Balance: {credits['balance']} credits")
            print(f"  Updated: {credits['updated_at']}")
        
        # Check payment history
        response = requests.get(
            f"{BASE_URL}/polar/admin/payments/user/{user_id}",
            headers={"Authorization": f"Bearer {ADMIN_KEY}"},
            timeout=10
        )
        
        if response.status_code == 200:
            payments = response.json()
            print(f"\n✓ Payment History ({len(payments)} payments):")
            for p in payments:
                print(f"  - ${p['amount']/100:.2f} → {p['credits_granted']} credits")
                print(f"    Status: {p['status']}")
                print(f"    Date: {p['created_at']}")
                print()
        
        # Create API key for testing
        print(f"\n{'='*70}")
        print("CREATE API KEY?")
        print(f"{'='*70}")
        print(f"Run this to create an API key:")
        print(f'curl -X POST "{BASE_URL}/admin/api-keys" \\')
        print(f'  -H "Authorization: Bearer {ADMIN_KEY}" \\')
        print(f'  -H "Content-Type: application/json" \\')
        print(f'  -d \'{{"user_id": "{user_id}"}}\'')
        
    else:
        print(f"\n✗ No user found with email: {email}")
        print(f"\nCheck if:")
        print(f"  - Webhook was received (check uvicorn logs)")
        print(f"  - ngrok is running")
        print(f"  - Email matches what you entered in checkout")
else:
    print(f"Error: {response.text}")

print("\n" + "="*70)
