"""
Check if credits were auto-refunded after failed scrape attempt
"""
import requests

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "0000"
USER_ID = "522b6dd5-ef75-4061-97e8-72de827b325e"  # From test_complete_flow.py

print("Checking credit balance for user who got 502 error...")
print("="*70)

response = requests.get(
    f"{BASE_URL}/admin/credits/{USER_ID}",
    headers={"Authorization": f"Bearer {ADMIN_KEY}"},
    timeout=10
)

if response.status_code == 200:
    credits = response.json()
    print(f"\nUser ID: {USER_ID}")
    print(f"Current Balance: {credits['balance']} credits")
    print(f"Updated At: {credits['updated_at']}")
    
    if credits['balance'] == 750:
        print(f"\n✓ Credits were AUTO-REFUNDED after 502 error!")
        print(f"  Original: 750 credits")
        print(f"  After failed scrape: 750 credits (refunded)")
    else:
        print(f"\n⚠ Balance changed: {credits['balance']} credits")
else:
    print(f"Error: {response.text}")

print("\n" + "="*70)
