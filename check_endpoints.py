import json

with open('Postman_Collection.postman_collection.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

firecrawl = [i for i in data['item'] if 'Firecrawl' in i.get('name', '')][0]
print(f"✓ Firecrawl API endpoints: {len(firecrawl['item'])}")

# List endpoint names
for item in firecrawl['item']:
    print(f"  - {item['name']}")
