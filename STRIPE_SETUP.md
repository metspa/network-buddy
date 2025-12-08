# Stripe Integration Setup Guide

## ✅ Completed
- Installed Stripe SDK
- Created all API endpoints
- Created subscription database schema
- Created UI components
- Integrated with landing page and dashboard

## 🔧 Remaining Setup Steps

### Step 1: Add Environment Variables

Update your `.env.local` file with your Stripe **TEST MODE** keys:

```bash
# Stripe - TEST MODE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where to find these:**

1. **Publishable Key & Secret Key**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Make sure you're in **Test mode** (toggle at top)
   - Copy both keys

2. **Price ID**:
   - Go to https://dashboard.stripe.com/test/products
   - Click on "Network Buddy Pro" product
   - Copy the Price ID (starts with `price_`)

3. **Webhook Secret** (we'll set this up in Step 3)

### Step 2: Run Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `lib/database/schema.sql` (lines 292-467)
3. Paste and run the SQL to create:
   - `subscriptions` table
   - `usage_logs` table
   - Helper functions for subscription management
4. Verify tables were created in the Table Editor

### Step 3: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app about subscription events (payment success, cancellation, etc.)

#### Option A: Local Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret (starts with `whsec_`) to `.env.local`

#### Option B: Deployed App (Production/Staging)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Step 4: Test the Integration

1. Start your dev server: `npm run dev`
2. Go to your landing page: http://localhost:3000
3. Click "Upgrade to Pro" on the Pro plan
4. You should be redirected to Stripe Checkout
5. Use a test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete the checkout
7. You should be redirected back to `/dashboard?checkout=success`
8. Verify the subscription banner shows "Pro Plan" and your payment was processed

### Step 5: Test Webhook Events

1. Go to Stripe Dashboard → Developers → Events
2. Find recent subscription events
3. Click "Send test webhook" to verify your endpoint is working
4. Check your app's subscription status updates correctly

### Step 6: Test Customer Portal

1. Log in to your app
2. Click "Manage Subscription" in the subscription banner
3. You should be redirected to Stripe's customer portal
4. Test:
   - Update payment method
   - Cancel subscription
   - Download invoices

## 🚀 Going Live

When you're ready to accept real payments:

1. **Complete Stripe account activation**:
   - Go to https://dashboard.stripe.com/account/onboarding
   - Complete all required business information

2. **Switch to Live Mode**:
   - In `.env.local`, replace test keys with live keys:
     ```bash
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_SECRET_KEY=sk_live_...
     STRIPE_PRO_PRICE_ID=price_...  # Create a new product in live mode
     STRIPE_WEBHOOK_SECRET=whsec_...  # Create new webhook in live mode
     ```

3. **Create Live Product**:
   - Switch to Live mode in Stripe Dashboard
   - Create "Network Buddy Pro" product again in live mode
   - Set price to $9/month (charged immediately, no trial)
   - Copy the new live Price ID

4. **Create Live Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint with your production URL
   - Select same events as test mode
   - Copy new webhook secret

5. **Deploy**:
   - Deploy your app with live keys in environment variables
   - Test with a real payment (you can refund it afterwards)

## 📊 Usage Tracking

Scan limits are automatically enforced:

- **Free Plan**: 5 scans/month
- **Pro Plan**: 50 scans/month

To increment scan count when a user scans a card, call:

```typescript
const { error } = await supabase.rpc('increment_scan_count', {
  p_user_id: userId
});
```

To check if user can scan:

```typescript
const { data: canScan } = await supabase.rpc('can_user_scan', {
  p_user_id: userId
});
```

## 🔍 Monitoring

Check these regularly:

1. **Stripe Dashboard**: Failed payments, churn rate
2. **Supabase Logs**: Database errors
3. **Webhook Events**: Ensure all events are being processed

## ❓ Troubleshooting

**Problem**: Checkout button doesn't work
- Check console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure you're logged in before clicking upgrade

**Problem**: Webhooks not received
- Verify webhook URL is correct
- Check webhook signing secret matches `.env.local`
- Test with Stripe CLI locally first

**Problem**: Subscription doesn't update after payment
- Check webhook events in Stripe Dashboard
- Verify database subscription record exists
- Check server logs for webhook errors

**Problem**: User can't upgrade
- Verify they're authenticated
- Check subscription table for existing record
- Verify Stripe customer was created

## 📝 Next Steps

After Stripe is working:

1. Integrate scan count check before allowing OCR
2. Show upgrade prompt when user hits limit
3. Add analytics to track conversion rate
4. Set up email notifications for trial ending
5. Create admin dashboard to monitor subscriptions
