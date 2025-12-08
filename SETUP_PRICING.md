# Pricing Strategy & Apollo.io Integration Setup

This guide walks you through setting up the new 3-tier pricing strategy with Apollo.io enrichment and credit purchases.

## Overview of Changes

- **Apollo.io Integration**: Premium email/phone enrichment for contacts
- **3-Tier Pricing**: Free (5), Growth (30), Pro (120) enrichments/month
- **Credit System**: Purchase credits for enrichments beyond subscription limits
- **Usage Enforcement**: Limits are now actively enforced in the API
- **New Database Tables**: `user_credits`, `enrichment_transactions`

---

## Step 1: Run Database Migrations

Run these SQL migrations in your Supabase SQL Editor **in order**:

### 1.1: Fix GHL Integrations (if using GoHighLevel)
```bash
lib/database/migrations/20250107_fix_ghl_integrations.sql
```

### 1.2: Create User Credits Table
```bash
lib/database/migrations/20250107_create_user_credits.sql
```

### 1.3: Create Enrichment Transactions Table
```bash
lib/database/migrations/20250107_create_enrichment_transactions.sql
```

### 1.4: Update Subscriptions Table
```bash
lib/database/migrations/20250107_update_subscriptions.sql
```

**To run**: Copy the SQL from each file and paste into Supabase SQL Editor, then click "Run".

---

## Step 2: Set Up Apollo.io

1. **Create Apollo.io Account**
   - Visit: https://www.apollo.io/
   - Sign up for a paid plan (required for API access)

2. **Get API Key**
   - Go to: https://app.apollo.io/#/settings/integrations/api
   - Generate a new API key

3. **Add to Environment**
   ```bash
   APOLLO_API_KEY=your_apollo_api_key_here
   ```

**Cost**: ~$0.10-0.50 per contact enrichment (only used when email OR phone is missing)

---

## Step 3: Create Stripe Products & Prices

### 3.1: Create Subscription Products

In Stripe Dashboard > Products:

**Growth Plan**
- Name: `Growth Plan`
- Description: `30 enrichments/month with Apollo.io`
- Pricing: `$29/month` (recurring)
- Copy the Price ID → `STRIPE_GROWTH_PRICE_ID`

**Pro Plan**
- Name: `Pro Plan`
- Description: `120 enrichments/month with Apollo.io`
- Pricing: `$79/month` (recurring)
- Copy the Price ID → `STRIPE_PRO_PRICE_ID`

### 3.2: Create Credit Products

**10 Credits**
- Name: `10 Credits`
- Description: `10 one-time enrichments`
- Pricing: `$15` (one-time)
- Copy the Price ID → `STRIPE_CREDITS_10_PRICE_ID`

**50 Credits**
- Name: `50 Credits`
- Description: `50 one-time enrichments`
- Pricing: `$50` (one-time)
- Copy the Price ID → `STRIPE_CREDITS_50_PRICE_ID`

**100 Credits**
- Name: `100 Credits`
- Description: `100 one-time enrichments`
- Pricing: `$90` (one-time)
- Copy the Price ID → `STRIPE_CREDITS_100_PRICE_ID`

---

## Step 4: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Apollo.io
APOLLO_API_KEY=your_apollo_api_key_here

# Stripe Growth Plan
STRIPE_GROWTH_PRICE_ID=price_xxx  # From Step 3.1

# Stripe Pro Plan (update existing)
STRIPE_PRO_PRICE_ID=price_xxx  # From Step 3.1

# Stripe Credits
STRIPE_CREDITS_10_PRICE_ID=price_xxx  # From Step 3.2
STRIPE_CREDITS_50_PRICE_ID=price_xxx  # From Step 3.2
STRIPE_CREDITS_100_PRICE_ID=price_xxx  # From Step 3.2
```

---

## Step 5: Test the Setup

### 5.1: Test Usage Enforcement

1. Create a test user in Free tier (5 enrichments)
2. Perform 5 enrichments
3. Try a 6th enrichment - should get 402 error: "No scans or credits remaining"

### 5.2: Test Credits Purchase

1. In Stripe Dashboard, enable Test Mode
2. Go to `/dashboard` as a test user
3. Click "Buy Credits"
4. Complete purchase with test card: `4242 4242 4242 4242`
5. Verify credits appear in database:
   ```sql
   SELECT * FROM user_credits WHERE user_id = 'your_test_user_id';
   ```

### 5.3: Test Apollo Enrichment

1. Create a contact with NO email and NO phone
2. Trigger enrichment
3. Check if email/phone were populated by Apollo
4. Verify `enrichment_transactions` table has record with `enrichment_type = 'apollo'`

---

## Step 6: Verify Stripe Webhook

1. **Get Webhook Secret**
   - Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook secret → `STRIPE_WEBHOOK_SECRET`

2. **Test Webhook Locally (optional)**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

---

## Pricing Strategy Summary

### Free Tier
- **Price**: $0/month
- **Enrichments**: 5/month
- **Apollo**: No
- **Target**: Trial users, hobbyists

### Growth Tier
- **Price**: $29/month
- **Enrichments**: 30/month
- **Apollo**: Yes (selective - only when missing data)
- **Add-ons**: Buy 10-packs for $12-15
- **Margin**: 70%
- **Target**: Active networkers, small teams

### Pro Tier
- **Price**: $79/month
- **Enrichments**: 120/month
- **Apollo**: Yes (selective)
- **Add-ons**: Buy 50-packs for $50-60
- **Margin**: 57%
- **Target**: Sales teams, recruiters, power users

### Credits (Add-Ons)
- **10 credits**: $15 ($1.50/credit)
- **50 credits**: $50 ($1.00/credit) - BEST VALUE
- **100 credits**: $90 ($0.90/credit)
- **Expiration**: Never
- **Margin**: 68-87%

---

## Cost Analysis

### Per-Enrichment Costs

**Base Enrichment** (no Apollo):
- SerpApi GMB: $0.01
- Perplexity AI: $0.015
- Serper (LinkedIn/News): $0.011
- OpenAI Summary: $0.0003
- **Total**: ~$0.036

**With Apollo** (selective - 60% need it):
- Base: $0.036
- Apollo: $0.25 (average)
- **Total**: ~$0.286
- **Weighted Average**: ~$0.186 (60% use Apollo, 40% don't)

### Revenue Margins

**Growth Plan**: $29 revenue - $5.58 cost = $23.42 profit (80.7%)
**Pro Plan**: $79 revenue - $22.32 cost = $56.68 profit (71.7%)
**Credits (50-pack)**: $50 revenue - $9.30 cost = $40.70 profit (81.4%)

---

## Troubleshooting

### Issue: "No subscription found" error

**Fix**: Ensure user has a subscription record:
```sql
SELECT * FROM subscriptions WHERE user_id = 'user_id_here';
```

If missing, create default:
```sql
INSERT INTO subscriptions (user_id, plan_name, status, monthly_scan_limit)
VALUES ('user_id_here', 'free', 'active', 5);
```

### Issue: Credits not appearing after purchase

**Check webhook logs**:
```bash
# Check Stripe Dashboard > Developers > Webhooks > [your endpoint]
# Look for "checkout.session.completed" events
```

**Verify database**:
```sql
SELECT * FROM user_credits WHERE user_id = 'user_id_here';
```

### Issue: Apollo enrichment not working

**Check API key**:
```bash
# Verify APOLLO_API_KEY is set
echo $APOLLO_API_KEY
```

**Check logs**:
```bash
# Look for "Apollo.io" in server logs
# Common errors: "API key not configured", "No person found"
```

---

## Next Steps

1. ✅ Run all database migrations
2. ✅ Set up Apollo.io API key
3. ✅ Create Stripe products/prices
4. ✅ Update environment variables
5. ✅ Test usage enforcement
6. ✅ Test credits purchase flow
7. ✅ Configure Stripe webhook
8. 🚀 **Deploy to production**
9. 📊 Monitor conversion rates
10. 🔄 Iterate on pricing based on data

---

## Support

For issues or questions:
- Check application logs: `npm run dev` (look for errors)
- Review Stripe Dashboard for payment issues
- Check Supabase logs for database errors
- Verify all environment variables are set correctly

Good luck with your launch! 🚀
