"""
Test API key creation for a specific user.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"

def test_api_key_creation(user_id):
    """Test creating an API key for a specific user."""
    print(f"Testing API key creation for user: {user_id}")
    
    url = f"{BASE_URL}/admin/api-keys"
    headers = {
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"user_id": user_id}
    
    print(f"\nRequest:")
    print(f"  URL: {url}")
    print(f"  Method: POST")
    print(f"  Headers: {headers}")
    print(f"  Body: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        print(f"\nResponse:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Headers: {dict(response.headers)}")
        
        try:
            result = response.json()
            print(f"  Body: {json.dumps(result, indent=2)}")
        except:
            print(f"  Body (text): {response.text}")
        
        if response.status_code in [200, 201]:
            print("\n✓ SUCCESS - API key created!")
            if isinstance(result, dict) and 'api_key' in result:
                print(f"  API Key ID: {result.get('id')}")
                print(f"  API Key: {result.get('api_key')}")
        else:
            print(f"\n✗ FAILED - Status {response.status_code}")
            
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")

if __name__ == "__main__":
    # First, get a user ID
    print("Fetching users...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {ADMIN_KEY}"},
            timeout=10
        )
        if response.status_code == 200:
            users = response.json()
            if users:
                print(f"Found {len(users)} users\n")
                # Use first user
                user_id = users[0]['id']
                print(f"Testing with user ID: {user_id}")
                print(f"User email: {users[0]['email']}\n")
                print("="*60)
                test_api_key_creation(user_id)
            else:
                print("No users found!")
        else:
            print(f"Failed to fetch users: {response.status_code}")
    except Exception as e:
        print(f"Error fetching users: {e}")
