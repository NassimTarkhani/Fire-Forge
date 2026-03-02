"""
Test update user endpoint.
"""
import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"
USER_ID = "f6ce58b6-2610-4e7f-9dc0-1b803524f051"

def test_update_user():
    """Test updating a user."""
    print(f"Testing update user endpoint...")
    print(f"User ID: {USER_ID}\n")
    
    url = f"{BASE_URL}/admin/users/{USER_ID}"
    headers = {
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    }
    
    # Update just the is_admin field
    payload = {"is_admin": True}
    
    print(f"Request:")
    print(f"  URL: {url}")
    print(f"  Method: PUT")
    print(f"  Body: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.put(url, headers=headers, json=payload, timeout=10)
        
        print(f"\nResponse:")
        print(f"  Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"  Body: {json.dumps(result, indent=2)}")
            print("\n✓ SUCCESS - User updated!")
        else:
            print(f"  Error: {response.text}")
            print(f"\n✗ FAILED - Status {response.status_code}")
            
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")

if __name__ == "__main__":
    test_update_user()
