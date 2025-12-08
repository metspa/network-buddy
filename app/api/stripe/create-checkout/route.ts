import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getProPlanPriceId, getGrowthPlanPriceId } from '@/lib/stripe/client';

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout session for Growth or Pro Plan subscription
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

    // Get plan from request body (defaults to 'pro' for backwards compatibility)
    const body = await req.json().catch(() => ({}));
    const plan = body.plan || 'pro';

    if (!['growth', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be growth or pro' },
        { status: 400 }
      );
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId || customerId === '') {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      if (existingSubscription) {
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id);
      } else {
        // Create subscription record
        await supabase.from('subscriptions').insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_name: 'free',
          status: 'active',
          monthly_scan_limit: 5,
        });
      }
    }

    // Get price ID based on plan
    const priceId = plan === 'growth' ? getGrowthPlanPriceId() : getProPlanPriceId();

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      success_url: `${req.nextUrl.origin}/dashboard?checkout=success&plan=${plan}`,
      cancel_url: `${req.nextUrl.origin}/dashboard?checkout=canceled`,
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
