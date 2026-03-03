# Polar Product Setup Guide

## Creating Products in Polar Dashboard

You need to create products in Polar.sh that customers can purchase. Here's the complete setup:

---

## Step 1: Access Polar Dashboard

1. Go to https://polar.sh
2. Log in to your account
3. Select your organization

---

## Step 2: Create Credit Products

Go to **Products** → **Create Product**

### Product 1: Starter Pack
- **Name**: 100 Credits - Starter Pack
- **Description**: Perfect for trying out FireForge API. Includes 100 credits for scraping and crawling.
- **Price**: $5.00 USD
- **Type**: One-time payment
- **Metadata** (optional): `{"credits": 100, "package": "starter"}`

### Product 2: Basic Pack  
- **Name**: 250 Credits - Basic Pack
- **Description**: Great for small projects. Includes 250 credits with 25% bonus.
- **Price**: $10.00 USD
- **Type**: One-time payment
- **Metadata** (optional): `{"credits": 250, "package": "basic"}`

### Product 3: Pro Pack (BEST VALUE)
- **Name**: 750 Credits - Pro Pack
- **Description**: Most popular! 750 credits with 50% bonus for serious projects.
- **Price**: $25.00 USD
- **Type**: One-time payment
- **Metadata** (optional): `{"credits": 750, "package": "pro"}`

### Product 4: Business Pack
- **Name**: 2,000 Credits - Business Pack
- **Description**: For high-volume usage. 2,000 credits with 100% bonus.
- **Price**: $50.00 USD
- **Type**: One-time payment
- **Metadata** (optional): `{"credits": 2000, "package": "business"}`

### Product 5: Enterprise Pack
- **Name**: 5,000 Credits - Enterprise Pack
- **Description**: Maximum value! 5,000 credits with 150% bonus for enterprise needs.
- **Price**: $100.00 USD
- **Type**: One-time payment
- **Metadata** (optional): `{"credits": 5000, "package": "enterprise"}`

---

## Step 3: Configure Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Add Endpoint**
3. **Endpoint URL**: 
   ```
   https://your-domain.com/polar/webhook
   ```
   (For local testing: Use ngrok - `ngrok http 8000`)

4. **Events to subscribe**:
   - ✅ `order.paid` (REQUIRED - when order is paid)
   - ✅ `order.refunded` (REQUIRED - when order is refunded)
   - ✅ `checkout.created` (optional - track checkout start)
   - ✅ `checkout.updated` (optional - track checkout progress)

5. **Save** and copy the **Webhook Secret** (starts with `whsec_`)

6. Add to your `.env` file:
   ```env
   POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Step 4: Get API Credentials

### Access Token:
1. Go to **Settings** → **API**
2. Click **Create Access Token**
3. Name it: "FireForge Gateway"
4. Copy the token (starts with `polar_at_`)
5. Add to `.env`:
   ```env
   POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxx
   ```

### Organization ID:
1. Look at your Polar URL: `https://polar.sh/yourorgname`
2. Your org ID is `yourorgname`
3. Add to `.env`:
   ```env
   POLAR_ORGANIZATION_ID=yourorgname
   ```

---

## Step 5: Create Checkout Links

You can create shareable checkout links for each product:

1. Go to your product in Polar dashboard
2. Click **Create Checkout Link**
3. Share this link with customers
4. When they complete checkout, webhook fires automatically!

**Example checkout flow:**
```
Customer → Polar Checkout → Payment → Webhook → Your API → Credits Added! ✓
```

---

## Step 6: Embed Polar Checkout (Optional)

### Option A: Direct Links
Share product links directly:
```
https://polar.sh/yourorg/products/100-credits-starter-pack
```

### Option B: Embed Checkout Button
```html
<a href="https://polar.sh/checkout?product=prod_xxxxx">
  <button>Buy 100 Credits - $5</button>
</a>
```

### Option C: Custom Pricing Page
Create a pricing page on your website with all packages:

```html
<div class="pricing-cards">
  <div class="card">
    <h3>Starter Pack</h3>
    <p class="price">$5</p>
    <p>100 Credits</p>
    <a href="https://polar.sh/checkout?product=prod_starter">Buy Now</a>
  </div>
  
  <div class="card featured">
    <h3>Pro Pack</h3>
    <p class="price">$25</p>
    <p>750 Credits</p>
    <span class="badge">BEST VALUE</span>
    <a href="https://polar.sh/checkout?product=prod_pro">Buy Now</a>
  </div>
  
  <!-- Add other packages -->
</div>
```

---

## Step 7: Test Payment Flow

### Using Polar Test Mode:

1. Enable **Test Mode** in Polar dashboard
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC
5. Complete checkout
6. Webhook fires → Credits added automatically!

### Verify in your system:
```powershell
# Check if credits were added
python check_credits.py
```

---

## What Happens After Payment?

```
1. Customer completes Polar checkout
   ↓
2. Polar sends webhook to: /polar/webhook
   ↓
3. System verifies HMAC signature
   ↓
4. Finds or creates user by email
   ↓
5. Calculates credits based on amount
   ↓
6. Grants credits to user
   ↓
7. Stores payment record
   ↓
8. Customer can create API key and use credits! ✓
```

---

## Pricing Strategy Tips

**Current packages are optimized for conversions:**

- **$5 Starter**: Low barrier to entry (100 credits)
- **$10 Basic**: Common price point (250 credits = 25% bonus)
- **$25 Pro**: Sweet spot for most users (750 credits = 50% bonus) ⭐
- **$50 Business**: High volume users (2000 credits = 100% bonus)
- **$100 Enterprise**: Best value (5000 credits = 150% bonus)

**The bulk discounts encourage larger purchases:**
- $5: 20 credits per dollar
- $10: 25 credits per dollar
- $25: 30 credits per dollar (+50% vs starter)
- $50: 40 credits per dollar (+100% vs starter)
- $100: 50 credits per dollar (+150% vs starter)

---

## Production Checklist

- [ ] All 5 products created in Polar
- [ ] Webhook endpoint configured
- [ ] `POLAR_WEBHOOK_SECRET` set in production `.env`
- [ ] `POLAR_ACCESS_TOKEN` set with proper permissions
- [ ] `POLAR_ORGANIZATION_ID` matches your org
- [ ] Test mode successful
- [ ] Switch to live mode
- [ ] Create pricing page on your website
- [ ] Test live payment
- [ ] Monitor webhook logs

---

## Support & Resources

- **Polar Docs**: https://polar.sh/docs
- **Polar API**: https://polar.sh/docs/api
- **Webhook Events**: https://polar.sh/docs/webhooks
- **Test Cards**: https://polar.sh/docs/testing

---

Your payment system is ready! Once products are created in Polar, customers can purchase and use credits immediately! 🚀
