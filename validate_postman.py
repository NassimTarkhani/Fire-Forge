import json

with open('Postman_Collection.postman_collection.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("✓ Valid JSON")
print(f"✓ Collection: {data['info']['name']}")
print(f"✓ Total items: {len(data['item'])}")

admin = [i for i in data['item'] if 'Admin' in i.get('name', '')][0]
print(f"✓ Admin endpoints: {len(admin['item'])}")

# Check if Create API Key has body
for item in admin['item']:
    if item['name'] == 'Create API Key':
        if 'body' in item['request']:
            print("✓ Create API Key endpoint has body (fixed!)")
        else:
            print("✗ Create API Key endpoint missing body")

print("\n✓ Postman collection is valid!")
