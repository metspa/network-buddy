/**
 * Usage Limit Enforcement Service
 *
 * CRITICAL: This service enforces subscription limits and credits
 * Currently, the database has limit functions but they are NEVER called
 * This service fixes that gap
 */

import { createClient } from '@/lib/supabase/server';
import { getApolloCost } from './apollo';

export type UsageCheckResult = {
  allowed: boolean;
  reason?: string;
  subscription: {
    plan: string;
    scansRemaining: number;
    scansLimit: number;
    scansUsed: number;
  };
  credits: {
    balance: number;
  };
};

export type Subscription = {
  plan_name: string;
  monthly_scan_limit: number;
  scans_used_this_period: number;
  includes_apollo: boolean;
};

export type UserCredits = {
  credits_balance: number;
  credits_purchased_total: number;
  credits_used_total: number;
};

/**
 * Check if a user can perform an enrichment
 *
 * Logic:
 * 1. Check subscription limits first (use subscription scans)
 * 2. If subscription exhausted, check credits
 * 3. If no credits, deny access
 *
 * @param userId - User ID to check
 * @returns Usage check result with allowed status
 */
export async function canUserEnrich(userId: string): Promise<UsageCheckResult> {
  const supabase = await createClient();

  // 1. Get subscription status
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subError || !subscription) {
    console.error('Failed to get subscription:', subError);
    return {
      allowed: false,
      reason: 'No active subscription found. Please contact support.',
      subscription: {
        plan: 'unknown',
        scansRemaining: 0,
        scansLimit: 0,
        scansUsed: 0,
      },
      credits: { balance: 0 },
    };
  }

  // 2. Get credits balance
  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const creditsBalance = credits?.credits_balance || 0;

  // 3. Check subscription limits first
  const scansRemaining = subscription.monthly_scan_limit - subscription.scans_used_this_period;

  if (scansRemaining > 0) {
    // User has scans remaining in subscription
    return {
      allowed: true,
      subscription: {
        plan: subscription.plan_name,
        scansRemaining,
        scansLimit: subscription.monthly_scan_limit,
        scansUsed: subscription.scans_used_this_period,
      },
      credits: { balance: creditsBalance },
    };
  }

  // 4. Subscription exhausted, check credits
  if (creditsBalance > 0) {
    // User has credits available
    return {
      allowed: true,
      subscription: {
        plan: subscription.plan_name,
        scansRemaining: 0,
        scansLimit: subscription.monthly_scan_limit,
        scansUsed: subscription.scans_used_this_period,
      },
      credits: { balance: creditsBalance },
    };
  }

  // 5. No scans or credits remaining
  return {
    allowed: false,
    reason: 'You have used all your monthly enrichments and have no credits remaining. Upgrade your plan or purchase credits to continue.',
    subscription: {
      plan: subscription.plan_name,
      scansRemaining: 0,
      scansLimit: subscription.monthly_scan_limit,
      scansUsed: subscription.scans_used_this_period,
    },
    credits: { balance: 0 },
  };
}

/**
 * Decrement usage after enrichment completes
 *
 * Logic:
 * 1. If user has subscription scans, use those first
 * 2. Otherwise, deduct from credits
 * 3. Log transaction for tracking
 *
 * @param userId - User ID
 * @param contactId - Contact ID being enriched
 * @param usedApollo - Whether Apollo enrichment was used
 */
export async function decrementUsage(
  userId: string,
  contactId: string,
  usedApollo: boolean
): Promise<void> {
  const supabase = await createClient();

  // 1. Get current subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  const scansRemaining = subscription.monthly_scan_limit - subscription.scans_used_this_period;

  // 2. Determine source and enrichment type
  let sourceType: 'subscription' | 'credits';
  const enrichmentType = usedApollo ? 'apollo' : 'basic';
  const costEstimate = getEnrichmentCost(usedApollo);

  if (scansRemaining > 0) {
    // Use subscription scan
    sourceType = 'subscription';

    // Call the database function to increment scan count
    const { error } = await supabase.rpc('increment_scan_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to increment scan count:', error);
      throw new Error('Failed to update subscription usage');
    }
  } else {
    // Use credit
    sourceType = 'credits';
    await deductCredit(userId);
  }

  // 3. Log transaction
  await logTransaction(userId, contactId, sourceType, enrichmentType, costEstimate);
}

/**
 * Deduct one credit from user's balance
 */
async function deductCredit(userId: string): Promise<void> {
  const supabase = await createClient();

  // First get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('credits_balance, credits_used_total')
    .eq('user_id', userId)
    .single();

  if (fetchError || !currentCredits) {
    console.error('Failed to fetch current credits:', fetchError);
    throw new Error('Failed to fetch current credits');
  }

  // Update credits (decrement balance, increment used)
  const { error } = await supabase
    .from('user_credits')
    .update({
      credits_balance: Math.max(0, (currentCredits.credits_balance || 0) - 1),
      credits_used_total: (currentCredits.credits_used_total || 0) + 1,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to deduct credit:', error);
    throw new Error('Failed to deduct credit');
  }
}

/**
 * Log enrichment transaction for analytics
 */
async function logTransaction(
  userId: string,
  contactId: string,
  sourceType: 'subscription' | 'credits',
  enrichmentType: 'basic' | 'apollo',
  costEstimate: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('enrichment_transactions').insert({
    user_id: userId,
    contact_id: contactId,
    source_type: sourceType,
    enrichment_type: enrichmentType,
    cost_estimate: costEstimate,
  });

  if (error) {
    // Don't throw - logging failures shouldn't block enrichment
    console.error('Failed to log transaction:', error);
  }
}

/**
 * Calculate estimated cost for an enrichment
 *
 * Base cost: $0.036
 * With Apollo: $0.286 (base + $0.25 Apollo average)
 */
function getEnrichmentCost(usedApollo: boolean): number {
  const baseCost = 0.036;
  const apolloCost = getApolloCost(usedApollo);
  return baseCost + apolloCost;
}

/**
 * Get user's current usage status
 *
 * @param userId - User ID
 * @returns Current usage details
 */
export async function getUserUsageStatus(userId: string): Promise<UsageCheckResult> {
  return canUserEnrich(userId);
}
