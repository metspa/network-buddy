import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;

        // Check if this is a credits purchase (not a subscription)
        if (session.metadata?.type === 'credits_purchase') {
          const userId = session.metadata.supabase_user_id;
          const creditsAmount = parseInt(session.metadata.credits_amount);

          if (!userId || !creditsAmount) {
            console.error('Missing user_id or credits_amount in checkout session metadata');
            break;
          }

          // Add credits to user account
          // First, check if user has existing credits record
          const { data: existingCredits } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (existingCredits) {
            // Update existing record
            const { error } = await supabase
              .from('user_credits')
              .update({
                credits_balance: (existingCredits.credits_balance || 0) + creditsAmount,
                credits_purchased_total: (existingCredits.credits_purchased_total || 0) + creditsAmount,
                last_purchase_date: new Date().toISOString(),
                last_purchase_amount: creditsAmount,
              })
              .eq('user_id', userId);

            if (error) {
              console.error('Failed to update credits:', error);
            } else {
              console.log(`Added ${creditsAmount} credits to user ${userId}`);
            }
          } else {
            // Create new record
            const { error } = await supabase
              .from('user_credits')
              .insert({
                user_id: userId,
                credits_balance: creditsAmount,
                credits_purchased_total: creditsAmount,
                credits_used_total: 0,
                last_purchase_date: new Date().toISOString(),
                last_purchase_amount: creditsAmount,
              });

            if (error) {
              console.error('Failed to create credits record:', error);
            } else {
              console.log(`Created credits record with ${creditsAmount} credits for user ${userId}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No supabase_user_id in subscription metadata');
          break;
        }

        // Determine plan details based on price ID
        const priceId = subscription.items.data[0]?.price.id;
        const isGrowth = priceId === process.env.STRIPE_GROWTH_PRICE_ID;
        const isPro = priceId === process.env.STRIPE_PRO_PRICE_ID;

        let planName = 'free';
        let scanLimit = 5;
        let includesApollo = false;

        if (isPro) {
          planName = 'pro';
          scanLimit = 120;
          includesApollo = true;
        } else if (isGrowth) {
          planName = 'growth';
          scanLimit = 30;
          includesApollo = true;
        }

        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            plan_name: planName,
            monthly_scan_limit: scanLimit,
            includes_apollo: includesApollo,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq('user_id', userId);

        console.log(`Subscription ${subscription.id} updated for user ${userId} (${planName})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No supabase_user_id in subscription metadata');
          break;
        }

        // Downgrade to free tier
        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: null,
            stripe_price_id: null,
            status: 'active',
            plan_name: 'free',
            monthly_scan_limit: 15,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
            trial_start: null,
            trial_end: null,
          })
          .eq('user_id', userId);

        console.log(`Subscription ${subscription.id} canceled for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Reset scan count at the start of a new billing period
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.supabase_user_id;

        if (userId) {
          await supabase.rpc('reset_scan_count', { p_user_id: userId });
          console.log(`Reset scan count for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.supabase_user_id;

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', userId);

          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
