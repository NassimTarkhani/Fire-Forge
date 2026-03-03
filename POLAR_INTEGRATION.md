# Polar Payment Integration Guide

FireForge now supports automatic credit purchases through [Polar](https://polar.sh) webhooks!

## Overview

Users can purchase credits via Polar, and the system will automatically:
1. Receive payment webhook from Polar
2. Create or find the user by email
3. Grant credits based on payment amount
4. Track all transactions in the database

## Setup

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
# Polar Payment Configuration
POLAR_ACCESS_TOKEN=polar_at_your-access-token
POLAR_WEBHOOK_SECRET=whsec_your-webhook-secret
POLAR_ORGANIZATION_ID=your-org-id
```

Get these from your Polar dashboard:
- **Access Token**: Settings → API → Create Access Token
- **Webhook Secret**: Settings → Webhooks → Show Secret
- **Organization ID**: Your organization URL slug

### 2. Run Database Migration

Add the payments table to your Supabase database:

```sql
-- Payments Table (for Polar payments)
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    polar_payment_id text UNIQUE NOT NULL,
    polar_subscription_id text,
    amount int NOT NULL,
    currency text DEFAULT 'USD',
    credits_granted int NOT NULL,
    status text NOT NULL,  -- 'pending', 'completed', 'failed', 'refunded'
    payment_method text,
    customer_email text,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_polar_payment_id ON payments(polar_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

### 3. Configure Polar Webhook

In your Polar dashboard:

1. Go to **Settings** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL: `https://your-domain.com/polar/webhook`
4. Select events to subscribe to:
   - `order.paid` ✅ (when order is paid)
   - `order.refunded` ✅ (when order is refunded)
   - `checkout.created` ✅ (optional - track checkout start)
   - `checkout.updated` ✅ (optional - track checkout progress)
5. Save and copy the webhook secret to your `.env` file

### 4. Restart Application

```bash
# Restart to load new environment variables
uvicorn app.main:app --reload
```

## Credit Packages

The system automatically calculates credits based on payment amount:

| Amount | Credits | Rate |
|--------|---------|------|
| $5.00  | 100     | 20 credits/$1 |
| $10.00 | 250     | 25 credits/$1 |
| $25.00 | 750     | 30 credits/$1 |
| $50.00 | 2,000   | 40 credits/$1 |
| $100.00| 5,000   | 50 credits/$1 |

Custom amounts calculate at 20 credits per dollar (1 credit = $0.05).

### Customizing Credit Packages

Edit `app/services/polar_service.py`:

```python
CREDIT_PACKAGES = {
    500: 100,      # $5 = 100 credits
    1000: 250,     # $10 = 250 credits
    2500: 750,     # $25 = 750 credits
    5000: 2000,    # $50 = 2000 credits
    10000: 5000,   # $100 = 5000 credits
}
```

## How It Works

### User Flow

1. **User makes payment on Polar** (via checkout link or subscription)
2. **Polar sends webhook** to `/polar/webhook`
3. **FireForge processes webhook:**
   - Verifies signature
   - Creates payment record
   - Finds/creates user by email
   - Grants credits
   - Updates payment status

### Event Handling

The webhook endpoint handles these Polar events:

#### `order.paid`
- Creates payment record
- Grants credits to user
- Creates user if doesn't exist

#### `order.refunded`
- Deducts credits from user (if possible)
- Marks payment as refunded

#### `checkout.created` / `checkout.updated`
- Tracks checkout progress (logged but no action taken)

## API Endpoints

### Webhook Endpoint (Public)

```http
POST /polar/webhook
```

**Headers:**
- `X-Polar-Signature`: Webhook signature for verification

**Body:** Polar webhook event payload

**Response:** `200 OK` with `{"success": true}`

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <ADMIN_MASTER_KEY>`

#### List Payments

```http
POST /polar/admin/payments
```

**Body:**
```json
{
  "user_id": "uuid-optional",
  "status": "completed",
  "limit": 100
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "polar_payment_id": "pi_xxx",
    "amount": 1000,
    "currency": "USD",
    "credits_granted": 250,
    "status": "completed",
    "customer_email": "user@example.com",
    "created_at": "2026-03-03T...",
    "updated_at": "2026-03-03T..."
  }
]
```

#### Get Payment

```http
GET /polar/admin/payments/{payment_id}
```

**Response:** Single payment object

#### Get User Payments

```http
GET /polar/admin/payments/user/{user_id}
```

**Response:** Array of payment objects for user

#### Reprocess Payment

```http
POST /polar/admin/payments/{payment_id}/reprocess
```

Manually reprocess a failed payment. Useful for recovery.

**Response:**
```json
{
  "success": true,
  "message": "Payment reprocessed successfully"
}
```

## Testing

### Test Webhook Locally

Use ngrok or similar tunnel:

```bash
# Start ngrok
ngrok http 8000

# Update Polar webhook URL to:
# https://your-ngrok-url.ngrok.io/polar/webhook
```

### Test Webhook Manually

```bash
curl -X POST http://localhost:8000/polar/webhook \
  -H "Content-Type: application/json" \
  -H "X-Polar-Signature: test-signature" \
  -d '{
    "type": "order.paid",
    "data": {
      "id": "order_test_123",
      "amount": 1000,
      "currency": "USD",
      "customer_email": "test@example.com"
    }
  }'
```

### Check Payment Records

```bash
# List all payments
curl -X POST http://localhost:8000/polar/admin/payments \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'

# Get specific payment
curl http://localhost:8000/polar/admin/payments/pi_test_123 \
  -H "Authorization: Bearer your-admin-key"

# Check user credits
curl http://localhost:8000/admin/credits/{user_id} \
  -H "Authorization: Bearer your-admin-key"
```

## User Registration Flow

When a user makes a payment:

1. **Email is used as identifier** - Polar provides customer email
2. **User is created automatically** if they don't exist
3. **Credits are initialized** and granted immediately
4. **User can then create API key** via admin endpoint

### Recommended Customer Flow

1. User purchases credits on Polar (with their email)
2. Admin creates API key for user: `POST /admin/api-keys`
3. User receives API key and can start using FireForge
4. User makes API calls with their key
5. Credits are deducted automatically

## Production Checklist

- [ ] Set secure `POLAR_WEBHOOK_SECRET` in production `.env`
- [ ] Use HTTPS for webhook endpoint
- [ ] Configure Polar webhook with production URL
- [ ] Test webhook with Polar test mode
- [ ] Monitor webhook logs for errors
- [ ] Set up Polar products/prices in dashboard
- [ ] Create checkout links for users
- [ ] Document pricing for customers

## Security

### Webhook Signature Verification

Every webhook is verified using HMAC-SHA256:

```python
# Automatic verification in polar_service.py
expected = hmac.new(
    webhook_secret.encode(),
    payload,
    hashlib.sha256
).hexdigest()

# Rejects webhook if signature doesn't match
```

### Best Practices

1. **Never disable signature verification** in production
2. **Use HTTPS** for webhook endpoint
3. **Rotate webhook secret** periodically
4. **Monitor failed webhooks** in Polar dashboard
5. **Log all webhook events** for audit trail

## Troubleshooting

### Webhook Not Received

- Check Polar webhook configuration
- Verify webhook URL is publicly accessible
- Check server logs for errors
- Test with ngrok tunnel locally

### Payment Not Processed

- Check webhook signature is valid
- Verify payment ID is unique
- Check customer email is provided
- Review error logs: `grep polar server.log`

### Credits Not Granted

- Check if payment status is 'completed'
- Verify user was created/found
- Check credit balance in database
- Review payment metadata

### Reprocessing Failed Payments

```bash
# Manually reprocess
curl -X POST http://localhost:8000/polar/admin/payments/pi_xxx/reprocess \
  -H "Authorization: Bearer admin-key"
```

## Support

- **Polar Documentation**: https://polar.sh/docs
- **Polar Discord**: https://discord.gg/polar
- **FireForge Issues**: Check application logs

## Example Integration

### Creating Checkout Links

In Polar dashboard:
1. Create a Product
2. Add Prices ($5, $10, $25, etc.)
3. Generate checkout links
4. Share links with customers

### Handling Subscriptions

For recurring subscriptions, the webhook will fire for each payment cycle, automatically granting credits each time.

---

**Ready to accept payments! 🎉**
