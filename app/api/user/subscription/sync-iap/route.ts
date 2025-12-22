import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, productId } = await req.json();

        // Basic validation
        if (!transactionId || !productId) {
            return NextResponse.json({ error: 'Missing transaction details' }, { status: 400 });
        }

        // TODO: Verify transactionId with RevenueCat using Secret Key
        // For now, we trust the client-side success for the initial version.
        // In production, you MUST verify this server-side to prevent fraud.

        // Update subscription in database
        // We assume 'pro' plan gives 10 scans/month
        const { error: updateError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                stripe_customer_id: `iap_${user.id}`, // Placeholder for IAP users
                status: 'active',
                plan_name: 'pro',
                monthly_scan_limit: 10,
                scans_used_this_period: 0, // Reset usage on new sub
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (updateError) {
            console.error('Error updating subscription:', updateError);
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Sync IAP Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
