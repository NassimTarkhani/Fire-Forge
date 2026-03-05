# FireForge Postman Collection

Complete Postman collection for testing the FireForge API.

## 🚀 Quick Start

### 1. Import the Collection
1. Open Postman
2. Click **Import**
3. Select `Postman_Collection.postman_collection.json`
4. The collection with all endpoints will be imported

### 2. Configure Environment Variables

The collection uses these variables (configured in Collection Variables):

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:8000` | Local development URL |
| `production_url` | `https://fireforge.kapturo.online` | Production API URL |
| `admin_key` | `0000` | Admin master key (change this!) |
| `user_api_key` | _(auto-filled)_ | User API key (set after registration) |
| `user_id` | _(auto-filled)_ | User ID (set after registration or user creation) |
| `job_id` | _(auto-filled)_ | Crawl job ID (set after starting a crawl) |
| `api_key_id` | _(auto-filled)_ | API key ID (set after creating API key) |

**To switch to production:**
1. Go to collection variables
2. Change `base_url` value to `{{production_url}}`
3. Update `admin_key` to your actual admin key

### 3. Test the API

#### For New Users (Self-Service Registration)

1. **Register User** - Create your account and get 50 free credits
   - ✅ No authentication required
   - 📧 Provide email and name
   - 🎁 Receive 50 free credits
   - 🔑 API key automatically saved to `user_api_key` variable
   - **Important:** API key is shown only once!

2. **Start Testing** - Use any Firecrawl endpoint
   - The `user_api_key` is automatically used in requests
   - Try "Scrape URL" under the Firecrawl folder

#### For Admins

1. **Create User** (Admin → Create User)
   - Requires admin authentication
   - Provide email and name
   - User ID automatically saved

2. **Create API Key** (Admin → Create API Key)
   - Requires admin authentication
   - Uses the saved `user_id`
   - API key automatically saved to `user_api_key`

3. **Manage Users & Credits**
   - List users, update user details
   - Add/deduct credits
   - View usage logs

## 📁 Collection Structure

### Public Endpoints
- ✅ **Health Check** - API status check
- 🏠 **Root** - API welcome message
- 📝 **Register User** - Self-service registration (50 free credits!)

### Admin Endpoints
- 👤 User Management (Create, List, Get, Update)
- 🔑 API Key Management (Create, List, Revoke)
- 💰 Credit Management (Get Balance, Add, Deduct)
- 📊 Usage Logs (View, Filter by user/date)

### Firecrawl Endpoints (Protected)
- 🌐 **Scrape URL** - Scrape single page
- 🕷️ **Start Crawl** - Crawl entire website
- 📍 **Get Crawl Status** - Check crawl progress
- ❌ **Cancel Crawl** - Stop running crawl
- 🗺️ **Map Website** - Get site structure
- 🔍 **Search** - Search the web
- 📦 **Batch Scrape** - Scrape multiple URLs

### Polar Payment Endpoints (Admin)
- 💳 List payments
- 🔍 Get payment details
- 🔄 Reprocess failed payments
- 👤 Get user payments

## 🔒 Authentication

### User API Key (Firecrawl Endpoints)
```
Authorization: Bearer {{user_api_key}}
```
- Automatically set after registration or API key creation
- Used for all Firecrawl operations
- Each operation costs credits

### Admin Master Key (Admin Endpoints)
```
Authorization: Bearer {{admin_key}}
```
- Set in collection variables
- Required for admin operations
- Full access to system

## 💡 Tips & Tricks

### Auto-Saved Variables
The collection automatically saves these values from responses:
- ✅ `user_api_key` - From registration or API key creation
- ✅ `user_id` - From registration or user creation
- ✅ `job_id` - From starting a crawl
- ✅ `api_key_id` - From API key creation

This makes testing seamless - just run requests in order!

### Testing Flow for New Users
```
1. Register User
   ↓ (saves user_api_key automatically)
2. Scrape URL
   ↓ (uses saved API key)
3. Check credits used
```

### Testing Flow for Admins
```
1. Create User (Admin)
   ↓ (saves user_id)
2. Create API Key (Admin)
   ↓ (saves user_api_key)
3. Add Credits (Admin)
   ↓
4. Test Firecrawl endpoints
```

## 🎯 Example Use Cases

### Scrape a Website
1. Run **Register User** (or use existing API key)
2. Go to **Firecrawl → Scrape URL**
3. Update the URL in the request body
4. Send request
5. Check credits deducted

### Crawl a Website
1. Run **Start Crawl** with target URL
2. Copy the `job_id` (auto-saved)
3. Run **Get Crawl Status** to check progress
4. Use **Cancel Crawl** if needed

### Admin User Management
1. **Create User** with email and name
2. **Create API Key** for the user
3. **Add Credits** to their account
4. User can now use the API!

## 📝 Request Body Examples

### Register User
```json
{
    "email": "user@example.com",
    "name": "John Doe"
}
```

### Scrape URL
```json
{
    "url": "https://example.com",
    "formats": ["markdown", "html"],
    "onlyMainContent": true
}
```

### Start Crawl
```json
{
    "url": "https://example.com",
    "maxDepth": 2,
    "limit": 10,
    "scrapeOptions": {
        "formats": ["markdown"]
    }
}
```

### Add Credits (Admin)
```json
{
    "user_id": "{{user_id}}",
    "amount": 100
}
```

## 🐛 Troubleshooting

### "Unauthorized" Error
- **For Firecrawl endpoints:** Check that `user_api_key` is set
- **For Admin endpoints:** Check that `admin_key` is correct
- Run **Register User** to get a valid API key

### "No available server" Error
- Check that `base_url` points to a running instance
- For production, set to `{{production_url}}`
- Verify the API is deployed and accessible

### "Insufficient credits" Error
- Check credit balance with **Get Credit Balance**
- Admin can add credits with **Add Credits**
- Or purchase more at: https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW

### Variables Not Saving
- Check the "Tests" tab in each request
- Console logs show what's being saved
- Manually set variables in Collection Variables if needed

## 📚 API Documentation

For detailed API documentation, see:
- [REGISTRATION.md](./REGISTRATION.md) - User registration guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [PLAYGROUND_PROMPT.md](./PLAYGROUND_PROMPT.md) - Playground implementation guide

## 🔗 Useful Links

- **Production API:** https://fireforge.kapturo.online
- **Buy Credits:** https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW
- **Polar Webhook:** https://fireforge.kapturo.online/polar/webhook

## 📦 Credit Costs

| Operation | Cost |
|-----------|------|
| Scrape | 1 credit per page |
| Crawl | 1 credit per page crawled |
| Map | 1 credit per site |
| Search | 1 credit per query |
| Batch Scrape | 1 credit per URL |

## ⚡ Quick Reference

### Get Started (New User)
```bash
POST /register
→ Receive API key + 50 credits
→ Use API key for all requests
```

### Get Started (Existing User)
```bash
Set user_api_key in Collection Variables
→ Start making requests
```

### Check Credits
```bash
GET /admin/credits/{user_id}
→ Requires admin key
```

### Get Help
```bash
GET /health
→ Check API status
```

---

**Need help?** Open an issue or check the documentation files in this repository.
