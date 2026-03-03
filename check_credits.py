"""
Check if credits were added for a specific user.
"""
import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"
USER_ID = "3a83be03-2af9-4920-9933-f097bb89bb84"

print("Checking credit balance for user...")
print(f"User ID: {USER_ID}\n")

url = f"{BASE_URL}/admin/credits/{USER_ID}"
headers = {"Authorization": f"Bearer {ADMIN_KEY}"}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ Credit Balance Found:")
        print(json.dumps(data, indent=2))
        print(f"\nBalance: {data['balance']} credits")
    elif response.status_code == 404:
        print("\n✗ No credit record found for this user!")
        print("\nThis means credits were NOT initialized/added.")
        print("\nACTION: Run this to add credits manually:")
        print(f'curl -X POST {BASE_URL}/admin/credits/add \\')
        print(f'  -H "Authorization: Bearer {ADMIN_KEY}" \\')
        print(f'  -H "Content-Type: application/json" \\')
        print(f'  -d \'{{"user_id": "{USER_ID}", "amount": 250}}\'')
    else:
        print(f"\nError: {response.text}")
        
except Exception as e:
    print(f"\n✗ ERROR: {str(e)}")
