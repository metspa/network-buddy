// API endpoint for triggering contact enrichment
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichContact } from '@/lib/enrichment/pipeline';
import { canUserEnrich, decrementUsage } from '@/lib/services/usage-limiter';

/**
 * POST /api/enrich
 * Trigger enrichment for a contact
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // CRITICAL: Check usage limits before enriching
    const usageCheck = await canUserEnrich(user.id);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason,
          upgrade: true,
          subscription: usageCheck.subscription,
          credits: usageCheck.credits,
        },
        { status: 402 } // Payment Required
      );
    }

    // Verify contact belongs to user
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, user_id')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Trigger enrichment
    const result = await enrichContact(contactId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Enrichment failed' },
        { status: 500 }
      );
    }

    // CRITICAL: Decrement usage after successful enrichment
    try {
      await decrementUsage(user.id, contactId, result.usedApollo || false);
    } catch (usageError) {
      console.error('Failed to decrement usage:', usageError);
      // Don't fail the enrichment if usage tracking fails
    }

    return NextResponse.json({
      success: true,
      linkedInUrl: result.linkedInUrl,
      companyWebsite: result.companyWebsite,
      companyIndustry: result.companyIndustry,
      recentNews: result.recentNews,
      aiSummary: result.aiSummary,
      icebreakers: result.icebreakers,
      usedApollo: result.usedApollo,
    });
  } catch (error) {
    console.error('Enrichment API error:', error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('SERPER_API_KEY')) {
        return NextResponse.json(
          { error: 'Research service not configured. Please contact administrator.' },
          { status: 500 }
        );
      }
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'AI service not configured. Please contact administrator.' },
          { status: 500 }
        );
      }
      if (error.message.includes('Contact not found')) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to enrich contact' },
      { status: 500 }
    );
  }
}
