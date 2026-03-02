"""
Test script to demonstrate batch scrape with inline results.
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_KEY = "fc_82f78a11a"  # Replace with your API key

def test_batch_scrape():
    """Test batch scrape endpoint with inline results."""
    print("Testing batch scrape with inline results...")
    
    url = f"{BASE_URL}/v1/batch/scrape"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Request to scrape multiple URLs
    payload = {
        "urls": [
            "https://example.com",
            "https://httpbin.org/html"
        ]
    }
    
    print(f"\nSending batch scrape request for {len(payload['urls'])} URLs...")
    print("Waiting for completion (this may take a moment)...")
    
    response = requests.post(url, headers=headers, json=payload, timeout=300)
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✓ SUCCESS - Received inline results!")
        print(f"\nResponse structure:")
        print(f"- Status: {data.get('status')}")
        print(f"- Total URLs: {data.get('total')}")
        print(f"- Completed: {data.get('completed')}")
        print(f"- Failed: {data.get('failed', 0)}")
        
        if 'data' in data:
            print(f"- Data items: {len(data['data'])}")
            print(f"\nFirst result preview:")
            first_item = data['data'][0]
            print(f"  - URL: {first_item.get('url', 'N/A')}")
            print(f"  - Success: {first_item.get('success', 'N/A')}")
            if 'markdown' in first_item:
                content = first_item['markdown'][:200]
                print(f"  - Content preview: {content}...")
        
        # Save full response to file
        with open('batch_response.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print("\n✓ Full response saved to batch_response.json")
        
    else:
        print(f"\n✗ Error: {response.text}")

if __name__ == "__main__":
    test_batch_scrape()
