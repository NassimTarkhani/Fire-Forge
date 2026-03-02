"""
Test extract endpoint.
"""
import requests
import json

BASE_URL = "http://localhost:8000"
API_KEY = "fc_ffdc8ba175ea299013630b5480acc9f88b41719740902994aa3c1e3725cfcc07"

def test_extract():
    """Test extract endpoint."""
    print("Testing /v1/extract endpoint...\n")
    
    url = f"{BASE_URL}/v1/extract"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Basic extract request
    payload = {
        "urls": ["https://example.com"],
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"}
            }
        }
    }
    
    print(f"Request:")
    print(f"  URL: {url}")
    print(f"  Body: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"\nResponse:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Body: {response.text[:500]}")
        
        if response.status_code == 200:
            print("\n✓ SUCCESS")
        else:
            print(f"\n✗ FAILED - Status {response.status_code}")
            
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")

if __name__ == "__main__":
    test_extract()
