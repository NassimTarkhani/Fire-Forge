# User Registration Guide

## Overview
FireForge now supports self-service user registration! New users can sign up and receive **50 free credits** instantly without needing admin approval.

## Registration Endpoint

### POST `/register`
Create a new user account with automatic API key generation and free credits.

#### Request Body
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Response (201 Created)
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "api_key": "fireforge_abc123def456...",
  "credits": 50,
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Error Responses

**400 Bad Request** - User already exists
```json
{
  "detail": "A user with this email already exists"
}
```

**500 Internal Server Error** - Registration failed
```json
{
  "detail": "Registration failed: [error message]"
}
```

## How It Works

1. **User submits** email and name
2. **System creates** a new user account
3. **API key generated** automatically (format: `fireforge_...`)
4. **50 credits granted** to the new account
5. **Credentials returned** - API key is shown **only once**!

## Important Notes

⚠️ **Save your API key immediately!** It is only shown once during registration. If you lose it, you'll need to contact an admin to generate a new one.

✅ **Free credits** allow you to start using the API right away:
- Scrape: 1 credit per page
- Crawl: 1 credit per page
- Map: 1 credit per site
- Search: 1 credit per query

## Example Usage

### cURL
```bash
curl -X POST https://fireforge.kapturo.online/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

### JavaScript (fetch)
```javascript
const response = await fetch('https://fireforge.kapturo.online/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
});

const data = await response.json();
console.log('API Key:', data.api_key);
console.log('Free Credits:', data.credits);

// Save the API key securely!
localStorage.setItem('fireforge_api_key', data.api_key);
```

### Python
```python
import requests

response = requests.post(
    'https://fireforge.kapturo.online/register',
    json={
        'email': 'user@example.com',
        'name': 'John Doe'
    }
)

data = response.json()
print(f"API Key: {data['api_key']}")
print(f"Free Credits: {data['credits']}")

# Save the API key securely!
with open('.env', 'a') as f:
    f.write(f"\nFIREFORGE_API_KEY={data['api_key']}\n")
```

## Using Your API Key

After registration, use your API key to authenticate requests:

```bash
curl -X POST https://fireforge.kapturo.online/v1/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Buying More Credits

When you run out of free credits, purchase more at:
👉 https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW

## Database Migration

If you're upgrading an existing FireForge installation, run this SQL migration:

```sql
-- Add name column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
```

Or use the migration file:
```bash
psql $DATABASE_URL < Database/migrations/001_add_user_name.sql
```

## Admin API Key Creation (Still Available)

Admins can still create API keys for users via the admin endpoints:
- `POST /admin/users` - Create user
- `POST /admin/api-keys` - Generate API key for existing user

## FAQ

**Q: Do I need a credit card to sign up?**  
A: No! Registration is completely free and requires only an email address.

**Q: How many free credits do I get?**  
A: Every new user receives 50 free credits.

**Q: What if I forget my API key?**  
A: Currently, you'll need to contact an admin to generate a new key. Keep your key safe!

**Q: Can I create multiple accounts?**  
A: Each email address can only be used once. One account per email.

**Q: How do I check my credit balance?**  
A: Contact your admin or check the usage logs (coming soon to user dashboard).

---

**Need help?** Check the API documentation or contact support.
