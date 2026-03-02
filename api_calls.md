## API Call Examples (curl)

Health
```bash
curl -sS http://localhost:8000/health
curl -sS http://localhost:8000/
```

Admin - Users
```bash
# Create user
curl -X POST http://localhost:8000/admin/users \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User Name"}'

# Get users
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/users

# Get user
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/users/{user_id}

# Update user
curl -X PUT http://localhost:8000/admin/users/{user_id} \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","is_active":true}'

# Delete user
curl -X DELETE -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/users/{user_id}
```

Admin - API Keys
```bash
# Create API key (response includes full api_key)
curl -X POST "http://localhost:8000/admin/api-keys?user_id={user_id}" \
  -H "Authorization: Bearer <admin_key>"

# List API keys
curl -H "Authorization: Bearer <admin_key>" "http://localhost:8000/admin/api-keys?user_id={user_id}&include_revoked=false"

# Revoke API key
curl -X POST http://localhost:8000/admin/api-keys/revoke \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"api_key_id":"uuid-here"}'
```

Admin - Credits
```bash
# Add credits
curl -X POST http://localhost:8000/admin/credits/add \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"{user_id}","amount":1000}'

# Get credit balance
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/credits/{user_id}
```

Admin - Pricing
```bash
# Create pricing
curl -X POST http://localhost:8000/admin/pricing \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"/v1/scrape","cost":1,"description":"Single page scrape"}'

# List pricing
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/pricing

# Get pricing for endpoint (URL-encode endpoint)
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/pricing/%2Fv1%2Fscrape

# Update pricing
curl -X PUT http://localhost:8000/admin/pricing/%2Fv1%2Fscrape \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"cost":2,"description":"Updated"}'

# Delete pricing
curl -X DELETE -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/pricing/%2Fv1%2Fscrape
```

Admin - Usage Logs and Stats
```bash
# Query usage logs
curl -X POST http://localhost:8000/admin/usage-logs \
  -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"{user_id}","start_date":"2026-03-01T00:00:00Z","end_date":"2026-03-03T00:00:00Z","limit":100}'

# Get stats
curl -H "Authorization: Bearer <admin_key>" http://localhost:8000/admin/stats
```

Firecrawl - User Endpoints (use user API key)
```bash
# Scrape
curl -X POST http://localhost:8000/v1/scrape \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown","html"]}'

# Start crawl
curl -X POST http://localhost:8000/v1/crawl \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","limit":10,"scrapeOptions":{"formats":["markdown"]}}'

# Get crawl status
curl -H "Authorization: Bearer <user_api_key>" http://localhost:8000/v1/crawl/{job_id}

# Cancel crawl
curl -X DELETE -H "Authorization: Bearer <user_api_key>" http://localhost:8000/v1/crawl/{job_id}

# Map
curl -X POST http://localhost:8000/v1/map \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Search
curl -X POST http://localhost:8000/v1/search \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"query":"search term","limit":10}'

# Extract
curl -X POST http://localhost:8000/v1/extract \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com"],"schema":{"type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"}}}}'

# Batch scrape
curl -X POST http://localhost:8000/v1/batch/scrape \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com","https://example.org"],"formats":["markdown"]}'

# Batch crawl
curl -X POST http://localhost:8000/v1/batch/crawl \
  -H "Authorization: Bearer <user_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com","https://example.org"],"limit":5}'
```

