// API endpoint for creating contacts manually (without business card image)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canUserEnrich, decrementUsage } from '@/lib/services/usage-limiter';

/**
 * POST /api/contacts/create
 * Create a new contact manually (without scanning a business card)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CHECK LIMIT BEFORE CREATING CONTACT
    const usageCheck = await canUserEnrich(user.id);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'scan_limit_reached',
          message: usageCheck.reason,
          subscription: usageCheck.subscription,
          credits: usageCheck.credits,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate that at least one enrichment field is provided
    if (!body.email && !body.phone && !body.company) {
      return NextResponse.json(
        { error: 'Please provide at least an email, phone number, or company name' },
        { status: 400 }
      );
    }

    // Insert contact into database
    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        job_title: body.job_title || null,
        card_image_url: null, // No card image for manual entry
        card_image_path: null, // No card image for manual entry
        enrichment_status: 'pending', // Will be triggered automatically
        image_type: null, // No image type for manual entry
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating contact:', insertError);
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    // Trigger enrichment asynchronously (don't wait for it)
    if (contact) {
      // Call the enrichment endpoint in the background
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact.id,
          // Provide available information for enrichment
          firstName: body.first_name || null,
          lastName: body.last_name || null,
          email: body.email || null,
          phone: body.phone || null,
          company: body.company || null,
        }),
      }).catch(err => {
        console.error('Error triggering enrichment:', err);
      });
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('POST /api/contacts/create error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
