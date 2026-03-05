# FireForge

A production-ready FastAPI gateway for managing access to a self-hosted Firecrawl instance with credit management, API key authentication, rate limiting, and usage tracking via Supabase.

## Features

- ✅ **Self-Service Registration** - Users can register and get 50 free credits instantly
- ✅ **API Key Authentication** - Secure API key generation and validation
- ✅ **Credit Management** - Per-request credit deduction with configurable endpoint pricing
- ✅ **Usage Logging** - Track all API usage with detailed metrics
- ✅ **Rate Limiting** - In-memory rate limiter to prevent abuse
- ✅ **Admin Dashboard** - Complete admin API for user and credit management
- ✅ **Firecrawl Proxy** - Full proxy support for all Firecrawl endpoints
- ✅ **Polar Payments** - Credit purchase integration via Polar
- ✅ **Supabase Integration** - PostgreSQL database with real schema
- ✅ **Production Ready** - Comprehensive error handling and logging
- ✅ **Docker Support** - Ready for containerized deployment

## Prerequisites

- Python 3.9+
- Supabase account and project
- Self-hosted Firecrawl instance

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection helpers
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py            # Authentication middleware
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py         # Pydantic models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py            # Registration and authentication
│   │   ├── admin.py           # Admin routes
│   │   ├── firecrawl.py       # Firecrawl proxy routes
│   │   └── polar.py           # Polar payment webhooks
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supabase_service.py    # Database operations
│   │   ├── credit_service.py      # Credit management
│   │   └── firecrawl_proxy.py     # Firecrawl proxy client
│   └── utils/
│       ├── __init__.py
│       ├── api_key.py         # API key utilities
│       └── rate_limiter.py    # Rate limiting
├── .env.example
├── requirements.txt
└── README.md
```

## Installation

### 1. Clone and Setup

```bash
# Navigate to project directory
cd "d:\FC+SRXNG"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the following schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- API Keys Table
CREATE TABLE api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    key_prefix text NOT NULL,
    hashed_key text NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Credits Table
CREATE TABLE credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    balance int DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Endpoint Pricing Table
CREATE TABLE endpoint_pricing (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint text UNIQUE NOT NULL,
    cost int NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Usage Logs Table
CREATE TABLE usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint text NOT NULL,
    request_size int,
    response_size int,
    credits_used int NOT NULL,
    status_code int NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
```

Required environment variables:

```env
# Supabase (get from Supabase project settings)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# Firecrawl instance URL
FIRECRAWL_BASE_URL=http://localhost:3002

# Admin master key (generate a secure random string)
ADMIN_MASTER_KEY=your-secure-random-key-here
```

### 4. Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Usage

### User Registration (Self-Service)

New users can register and get started instantly with 50 free credits!

```bash
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "api_key": "fireforge_abc123def456...",
  "credits": 50,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**⚠️ Important:** Save your API key immediately - it's only shown once!

After registration, you can use your API key to access all Firecrawl endpoints. See [REGISTRATION.md](./REGISTRATION.md) for more details.

### Using Your API Key

Once you have an API key (from registration or admin), use it to access Firecrawl endpoints:

```bash
# Scrape a URL
curl -X POST "http://localhost:8000/v1/scrape" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'
```

### Admin Operations

All admin endpoints require the `Authorization: Bearer <ADMIN_MASTER_KEY>` header.

#### 1. Create a User

```bash
curl -X POST "http://localhost:8000/admin/users" \
  -H "Authorization: Bearer your-admin-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "is_admin": false
  }'
```

#### 2. Create API Key for User

```bash
curl -X POST "http://localhost:8000/admin/api-keys?user_id=<USER_UUID>" \
  -H "Authorization: Bearer your-admin-master-key"
```

**Important**: Save the returned API key - it's only shown once!

#### 3. Add Credits to User

```bash
curl -X POST "http://localhost:8000/admin/credits/add" \
  -H "Authorization: Bearer your-admin-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<USER_UUID>",
    "amount": 1000
  }'
```

#### 4. Set Endpoint Pricing

```bash
curl -X POST "http://localhost:8000/admin/pricing" \
  -H "Authorization: Bearer your-admin-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/v1/scrape",
    "cost": 1
  }'
```

#### 5. View Usage Logs

```bash
curl -X POST "http://localhost:8000/admin/usage-logs" \
  -H "Authorization: Bearer your-admin-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100
  }'
```

#### 6. Get Statistics

```bash
curl -X GET "http://localhost:8000/admin/stats" \
  -H "Authorization: Bearer your-admin-master-key"
```

### User Operations (Firecrawl Proxy)

All Firecrawl endpoints require `Authorization: Bearer <USER_API_KEY>` header.

#### Scrape a URL

```bash
curl -X POST "http://localhost:8000/v1/scrape" \
  -H "Authorization: Bearer fg_<user-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html"]
  }'
```

#### Start a Crawl

```bash
curl -X POST "http://localhost:8000/v1/crawl" \
  -H "Authorization: Bearer fg_<user-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 100
  }'
```

#### Get Crawl Status

```bash
curl -X GET "http://localhost:8000/v1/crawl/<JOB_ID>" \
  -H "Authorization: Bearer fg_<user-api-key>"
```

#### Map a Website

```bash
curl -X POST "http://localhost:8000/v1/map" \
  -H "Authorization: Bearer fg_<user-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

## Supported Firecrawl Endpoints

All endpoints automatically proxy to your Firecrawl instance:

- ✅ `POST /v1/scrape` - Scrape a single URL
- ✅ `POST /v1/crawl` - Start a crawl job
- ✅ `GET /v1/crawl/{jobId}` - Get crawl status
- ✅ `DELETE /v1/crawl/{jobId}` - Cancel crawl job
- ✅ `POST /v1/map` - Map a website
- ✅ `POST /v1/search` - Search functionality
- ✅ `POST /v1/extract` - Extract data
- ✅ `POST /v1/batch/scrape` - Batch scrape
- ✅ `POST /v1/batch/crawl` - Batch crawl

## API Reference

### Authentication

- **Public Endpoints**: `/register`, `/health` - No authentication required
- **User Operations**: Use generated API key (starts with `fireforge_`)
  - Obtain via self-service registration (`POST /register`)
  - Or admin-created API keys (`POST /admin/api-keys`)
- **Admin Operations**: Use `ADMIN_MASTER_KEY` in Authorization header

### Response Codes

- `200` - Success
- `401` - Invalid or missing API key
- `402` - Insufficient credits
- `403` - Admin privileges required
- `429` - Rate limit exceeded
- `502` - Error communicating with Firecrawl
- `504` - Firecrawl timeout

### Rate Limiting

- Default: 100 requests per 60 seconds per user
- Configurable via environment variables
- Returns `429` when exceeded

### Credit System

- Credits are deducted before each request
- Configurable cost per endpoint
- Automatic refund on request failure
- Default cost: 1 credit per request

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_KEY` | Supabase API key | Required |
| `FIRECRAWL_BASE_URL` | Firecrawl instance URL | Required |
| `FIRECRAWL_TIMEOUT` | Request timeout (seconds) | 300 |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | true |
| `RATE_LIMIT_REQUESTS` | Requests per window | 100 |
| `RATE_LIMIT_WINDOW` | Window size (seconds) | 60 |
| `ADMIN_MASTER_KEY` | Admin authentication key | Required |
| `DEBUG` | Debug mode | false |

## Production Deployment

### Database Migration

If upgrading from an older version, run the migration to add the `name` field:

```sql
-- Add name column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
```

Or use the migration file:
```bash
psql $DATABASE_URL < Database/migrations/001_add_user_name.sql
```

### Docker Deployment

For containerized deployment, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - VPS-specific instructions
- [Docker/](./Docker/) - Docker configuration files

Production instance: **https://fireforge.kapturo.online**

### Security Considerations

1. **Use HTTPS** - Always use HTTPS in production
2. **Secure Admin Key** - Generate a strong random key for `ADMIN_MASTER_KEY`
3. **Supabase Service Role** - Use service role key for database operations
4. **CORS** - Configure `allow_origins` in `main.py` for your domains
5. **Rate Limiting** - Adjust limits based on your needs
6. **Monitoring** - Set up logging and monitoring

### Performance Optimization

1. **Workers** - Run with multiple workers: `--workers 4`
2. **Database Connection** - Connection pooling is handled by Supabase client
3. **Caching** - Consider adding Redis for rate limiting in high-traffic scenarios
4. **Timeouts** - Adjust `FIRECRAWL_TIMEOUT` based on your use case

### Recommended Production Setup

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

## Troubleshooting

### Database Connection Issues

```bash
# Test Supabase connection
python -c "from app.services.supabase_service import SupabaseService; from app.config import get_settings; s = get_settings(); print('Connected!' if SupabaseService(s.supabase_url, s.supabase_key).client else 'Failed')"
```

### Firecrawl Connection Issues

```bash
# Test Firecrawl connectivity
curl http://localhost:3002/health
```

### API Key Issues

- Ensure API keys start with `fg_`
- Check if key is revoked in database
- Verify key was created for correct user

### Credit Issues

- Check user credit balance via admin API
- Verify endpoint pricing is configured
- Check usage logs for deductions

## License

This project is provided as-is for use with self-hosted Firecrawl instances.

## Support

For issues related to:
- **This Gateway**: Check logs and configuration
- **Firecrawl**: See Firecrawl documentation
- **Supabase**: See Supabase documentation

## Contributing

This is a production-ready template. Customize as needed for your use case.

---

**Built with FastAPI, Supabase, and ❤️**
