import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getCreditsPriceId } from '@/lib/stripe/client';

/**
 * POST /api/stripe/create-checkout-credits
 * Creates a Stripe Checkout session for one-time credit purchases
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { packageType } = body; // '10', '50', '100'

    if (!packageType || !['10', '50', '100'].includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package type. Must be 10, 50, or 100' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create Stripe customer if doesn't exist or is invalid (must start with 'cus_')
    const isValidCustomerId = customerId && customerId.startsWith('cus_');
    if (!isValidCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Credits amount mapping
    const creditsMap: Record<string, number> = {
      '10': 10,
      '50': 50,
      '100': 100,
    };

    const creditsAmount = creditsMap[packageType];

    // Create Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // ONE-TIME payment (not subscription)
      payment_method_types: ['card'],
      line_items: [
        {
          price: getCreditsPriceId(packageType),
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
        credits_amount: creditsAmount.toString(),
        type: 'credits_purchase',
        package_type: packageType,
      },
      success_url: `${req.nextUrl.origin}/dashboard?credits=success&amount=${creditsAmount}`,
      cancel_url: `${req.nextUrl.origin}/dashboard?credits=canceled`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe credits checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
