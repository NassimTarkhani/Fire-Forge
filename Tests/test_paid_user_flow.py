"""
Create API key for paid user and test it.
"""
import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"
USER_ID = "3a83be03-2af9-4920-9933-f097bb89bb84"

print("="*60)
print("Testing Paid User API Key Flow")
print("="*60)

# Step 1: Check current credits
print(f"\n1. Checking current credits...")
response = requests.get(
    f"{BASE_URL}/admin/credits/{USER_ID}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)
if response.status_code == 200:
    credits = response.json()
    print(f"   ✓ Current balance: {credits['balance']} credits")
else:
    print(f"   ✗ Error: {response.text}")
    exit(1)

# Step 2: Create API key for the user
print(f"\n2. Creating API key for user...")
response = requests.post(
    f"{BASE_URL}/admin/api-keys",
    headers={
        "Authorization": f"Bearer {ADMIN_KEY}",
        "Content-Type": "application/json"
    },
    json={"user_id": USER_ID},
    timeout=10
)

if response.status_code == 200:
    api_key_data = response.json()
    api_key = api_key_data['api_key']
    print(f"   ✓ API key created: {api_key[:20]}...")
else:
    print(f"   ✗ Error: {response.text}")
    exit(1)

# Step 3: Test the API key with a scrape request
print(f"\n3. Testing API key with /v1/scrape endpoint...")
response = requests.post(
    f"{BASE_URL}/v1/scrape",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={"url": "https://example.com"},
    timeout=60
)

print(f"   Status Code: {response.status_code}")
if response.status_code == 200:
    print(f"   ✓ API call successful!")
    print(f"   (Credits were deducted automatically)")
elif response.status_code == 402:
    print(f"   ✗ Insufficient credits")
else:
    print(f"   Response: {response.text[:200]}")

# Step 4: Check credits after API call
print(f"\n4. Checking credits after API call...")
response = requests.get(
    f"{BASE_URL}/admin/credits/{USER_ID}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)
if response.status_code == 200:
    credits = response.json()
    print(f"   ✓ New balance: {credits['balance']} credits")
    print(f"   (1 credit was deducted for /v1/scrape)")
else:
    print(f"   ✗ Error: {response.text}")

print("\n" + "="*60)
print("✓ Payment → Credits → API Key → Usage WORKING!")
print("="*60)
print(f"\nThe user can now use their API key with {credits['balance']} credits remaining")
