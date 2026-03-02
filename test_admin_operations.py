"""
Comprehensive test for all admin operations.
"""
import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"

def print_section(title):
    """Print a section header."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_endpoint(method, endpoint, description, data=None, params=None):
    """Test an endpoint and print results."""
    print(f"\n{description}...")
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            print(f"❌ Unknown method: {method}")
            return None
        
        status = response.status_code
        if status in [200, 201]:
            print(f"✓ SUCCESS ({status})")
            try:
                result = response.json()
                print(f"  Response: {json.dumps(result, indent=2)[:500]}")
                return result
            except:
                print(f"  Response: {response.text[:200]}")
                return response.text
        else:
            print(f"✗ FAILED ({status})")
            print(f"  Error: {response.text}")
            return None
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return None

def main():
    print("ADMIN OPERATIONS TEST SUITE")
    print(f"Testing against: {BASE_URL}")
    print(f"Using admin key: {ADMIN_KEY}")
    
    # Store IDs for later tests
    user_id = None
    api_key_id = None
    api_key = None
    
    # ===== USER MANAGEMENT =====
    print_section("USER MANAGEMENT")
    
    # Create user
    test_email = f"testuser_{int(datetime.now().timestamp())}@example.com"
    result = test_endpoint(
        "POST", "/admin/users",
        "Creating new user",
        data={"email": test_email, "is_admin": False}
    )
    if result:
        user_id = result.get("id")
        print(f"  → Created user ID: {user_id}")
    
    # List users
    result = test_endpoint(
        "GET", "/admin/users",
        "Listing all users"
    )
    if result:
        print(f"  → Found {len(result)} users")
    
    # ===== API KEY MANAGEMENT =====
    print_section("API KEY MANAGEMENT")
    
    if user_id:
        # Create API key
        result = test_endpoint(
            "POST", "/admin/api-keys",
            f"Creating API key for user {user_id}",
            data={"user_id": user_id}
        )
        if result:
            api_key_id = result.get("id")
            api_key = result.get("api_key")
            print(f"  → Created API key ID: {api_key_id}")
            print(f"  → API Key: {api_key}")
    
    # List API keys
    result = test_endpoint(
        "GET", "/admin/api-keys",
        "Listing all API keys"
    )
    if result:
        print(f"  → Found {len(result)} API keys")
    
    # List API keys for specific user
    if user_id:
        result = test_endpoint(
            "GET", "/admin/api-keys",
            f"Listing API keys for user {user_id}",
            params={"user_id": user_id}
        )
        if result:
            print(f"  → Found {len(result)} API keys for this user")
    
    # ===== CREDIT MANAGEMENT =====
    print_section("CREDIT MANAGEMENT")
    
    if user_id:
        # Get credits
        result = test_endpoint(
            "GET", f"/admin/credits/{user_id}",
            f"Getting credits for user {user_id}"
        )
        if result:
            print(f"  → Current balance: {result.get('balance')} credits")
        
        # Add credits
        result = test_endpoint(
            "POST", "/admin/credits/add",
            f"Adding 1000 credits to user {user_id}",
            data={"user_id": user_id, "amount": 1000}
        )
        if result:
            print(f"  → New balance: {result.get('balance')} credits")
        
        # Get credits again to verify
        result = test_endpoint(
            "GET", f"/admin/credits/{user_id}",
            f"Verifying credit balance"
        )
        if result:
            print(f"  → Verified balance: {result.get('balance')} credits")
    
    # ===== ENDPOINT PRICING =====
    print_section("ENDPOINT PRICING")
    
    # Set pricing
    result = test_endpoint(
        "POST", "/admin/pricing",
        "Setting pricing for /v1/test endpoint",
        data={"endpoint": "/v1/test", "cost": 5}
    )
    
    # List pricing
    result = test_endpoint(
        "GET", "/admin/pricing",
        "Listing all endpoint pricing"
    )
    if result:
        print(f"  → Found {len(result)} pricing entries")
    
    # ===== USAGE LOGS =====
    print_section("USAGE LOGS")
    
    # Get all usage logs
    result = test_endpoint(
        "POST", "/admin/usage-logs",
        "Getting all usage logs (last 10)",
        data={"limit": 10}
    )
    if result:
        print(f"  → Found {len(result)} usage logs")
    
    # Get usage logs for specific user
    if user_id:
        result = test_endpoint(
            "POST", "/admin/usage-logs",
            f"Getting usage logs for user {user_id}",
            data={"user_id": user_id, "limit": 10}
        )
        if result:
            print(f"  → Found {len(result)} usage logs for this user")
    
    # ===== STATISTICS =====
    print_section("STATISTICS")
    
    result = test_endpoint(
        "GET", "/admin/stats",
        "Getting overall statistics"
    )
    if result:
        print(f"  → Total users: {result.get('total_users')}")
        print(f"  → Total API keys: {result.get('total_api_keys')}")
        print(f"  → Total credits: {result.get('total_credits_distributed')}")
        print(f"  → Total requests: {result.get('total_requests')}")
    
    # ===== API KEY REVOCATION =====
    print_section("API KEY REVOCATION")
    
    if api_key_id:
        # Test API key first
        if api_key:
            print(f"\nTesting API key before revocation...")
            test_url = f"{BASE_URL}/v1/scrape"
            test_headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            test_data = {"url": "https://example.com"}
            try:
                response = requests.post(test_url, headers=test_headers, json=test_data, timeout=30)
                print(f"  API Key works: {response.status_code in [200, 201]}")
            except Exception as e:
                print(f"  API Key test error: {str(e)}")
        
        # Revoke API key
        result = test_endpoint(
            "POST", "/admin/api-keys/revoke",
            f"Revoking API key {api_key_id}",
            data={"api_key_id": api_key_id}
        )
        
        # Test API key after revocation
        if api_key:
            print(f"\nTesting API key after revocation...")
            try:
                response = requests.post(test_url, headers=test_headers, json=test_data, timeout=30)
                if response.status_code == 401:
                    print(f"  ✓ API Key correctly rejected (401)")
                else:
                    print(f"  ✗ API Key still works ({response.status_code})")
            except Exception as e:
                print(f"  Test error: {str(e)}")
    
    print_section("TEST COMPLETE")

if __name__ == "__main__":
    main()
