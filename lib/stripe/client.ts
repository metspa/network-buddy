import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance (server-side only)
 * Lazy initialization to avoid build-time errors
 * Never expose this to the client - contains secret key
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getStripeClient() instead
 */
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripeClient()[prop as keyof Stripe];
  },
});

/**
 * Get Stripe publishable key for client-side usage
 */
export function getStripePublishableKey() {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/**
 * Get Stripe Price ID for Pro Plan
 */
export function getProPlanPriceId() {
  if (!process.env.STRIPE_PRO_PRICE_ID) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set');
  }
  return process.env.STRIPE_PRO_PRICE_ID;
}

/**
 * Get Stripe Price ID for Growth Plan
 */
export function getGrowthPlanPriceId() {
  if (!process.env.STRIPE_GROWTH_PRICE_ID) {
    throw new Error('STRIPE_GROWTH_PRICE_ID is not set');
  }
  return process.env.STRIPE_GROWTH_PRICE_ID;
}

/**
 * Get Stripe Price ID for Credits packages
 * @param packageType - '10', '50', or '100'
 */
export function getCreditsPriceId(packageType: string) {
  const priceIdMap: Record<string, string | undefined> = {
    '10': process.env.STRIPE_CREDITS_10_PRICE_ID,
    '50': process.env.STRIPE_CREDITS_50_PRICE_ID,
    '100': process.env.STRIPE_CREDITS_100_PRICE_ID,
  };

  const priceId = priceIdMap[packageType];

  if (!priceId) {
    throw new Error(`STRIPE_CREDITS_${packageType}_PRICE_ID is not set`);
  }

  return priceId;
}
