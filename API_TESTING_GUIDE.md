# API Testing Guide

## Prerequisites
- Base URL: `http://localhost:8000`
- Admin Key: From `.env` → `ADMIN_MASTER_KEY`
- User API Key: Generated via `/admin/api-keys` (starts with `fg_...`)

---

## Health Endpoints

```http
GET /health
GET /
```

---

## Admin Endpoints

### Users
```http
POST   /admin/users
GET    /admin/users
GET    /admin/users/{user_id}
PUT    /admin/users/{user_id}
DELETE /admin/users/{user_id}
```

**Create User Body:**
```json
{"email": "user@example.com", "name": "User Name"}
```

### API Keys
```http
POST   /admin/api-keys?user_id={user_id}
GET    /admin/api-keys?user_id={user_id}&include_revoked=false
POST   /admin/api-keys/revoke
```

**Revoke Body:**
```json
{"api_key_id": "uuid-here"}
```

### Credits
```http
POST /admin/credits/add
GET  /admin/credits/{user_id}
```

**Add Credits Body:**
```json
{"user_id": "uuid-here", "amount": 1000}
```

### Pricing
```http
POST   /admin/pricing
GET    /admin/pricing
GET    /admin/pricing/{endpoint}
PUT    /admin/pricing/{endpoint}
DELETE /admin/pricing/{endpoint}
```

**Create/Update Pricing Body:**
```json
{"endpoint": "/v1/scrape", "cost": 1, "description": "Single page scrape"}
```

### Usage Logs
```http
POST /admin/usage-logs
```

**Query Body:**
```json
{
  "user_id": "uuid-here",
  "start_date": "2026-03-01T00:00:00Z",
  "end_date": "2026-03-03T00:00:00Z",
  "limit": 100
}
```

### Stats
```http
GET /admin/stats
```

---

## Firecrawl Endpoints

**All require:** `Authorization: Bearer <user_api_key>`

### Scrape
```http
POST /v1/scrape
```
**Body:**
```json
{"url": "https://example.com", "formats": ["markdown", "html"]}
```

### Crawl
```http
POST   /v1/crawl
GET    /v1/crawl/{job_id}
DELETE /v1/crawl/{job_id}
```
**Start Crawl Body:**
```json
{"url": "https://example.com", "limit": 10, "scrapeOptions": {"formats": ["markdown"]}}
```

### Map
```http
POST /v1/map
```
**Body:**
```json
{"url": "https://example.com"}
```

### Search
```http
POST /v1/search
```
**Body:**
```json
{"query": "search term", "limit": 10}
```

### Extract
```http
POST /v1/extract
```
**Body:**
```json
{
  "urls": ["https://example.com"],
  "schema": {
    "type": "object",
    "properties": {
      "title": {"type": "string"},
      "description": {"type": "string"}
    }
  }
}
```

### Batch
```http
POST /v1/batch/scrape
POST /v1/batch/crawl
```
**Batch Scrape Body:**
```json
{"urls": ["https://example.com", "https://example.org"], "formats": ["markdown"]}
```

**Batch Crawl Body:**
```json
{"urls": ["https://example.com", "https://example.org"], "limit": 5}
```

---

## Testing Flow

1. Create User → Save `user_id`
2. Add Credits (1000) to user
3. Create API Key → Save `api_key`
4. Test endpoints with `api_key`
5. Verify credit deductions and usage logs

---

## Notes

- Replace `{user_id}`, `{job_id}`, `<admin_key>`, `<user_api_key>` with actual values
- URL-encode paths: `/v1/scrape` → `%2Fv1%2Fscrape`
- Admin endpoints require admin key authorization
- User endpoints require user API key authorization

---

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

