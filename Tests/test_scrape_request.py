"""
Test the scrape endpoint to see the exact error message
"""
import requests
import json

BASE_URL = "http://localhost:8000"
API_KEY = "fg_b8133f60cf615d7b9f7abe065259ab3634692360fe05d7a76f7cc7f682e5c7ae"

print("Testing /v1/scrape endpoint...")
print("="*70)

# Test 1: With formats as array
print("\n1. Testing with 'formats' as array:")
response = requests.post(
    f"{BASE_URL}/v1/scrape",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "url": "https://example.com",
        "formats": ["markdown"]
    },
    timeout=10
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")

# Test 2: Minimal request - just URL
print("\n2. Testing with just 'url':")
response = requests.post(
    f"{BASE_URL}/v1/scrape",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "url": "https://example.com"
    },
    timeout=10
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")

# Test 3: According to Firecrawl docs
print("\n3. Testing Firecrawl standard format:")
response = requests.post(
    f"{BASE_URL}/v1/scrape",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "url": "https://example.com",
        "formats": ["markdown", "html"]
    },
    timeout=10
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")

print("\n" + "="*70)
print("If you see 422, check the 'detail' field for validation errors")
