// API endpoints for contacts CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { getContacts, createContact } from '@/lib/database/contacts';
import { createClient } from '@/lib/supabase/server';
import { canUserEnrich, decrementUsage } from '@/lib/services/usage-limiter';
import { sendScanLimitEmail } from '@/lib/services/email';

/**
 * GET /api/contacts
 * Fetch all contacts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const enrichmentStatus = searchParams.get('enrichmentStatus') as any;
    const favorited = searchParams.get('favorited') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const contacts = await getContacts({
      search,
      enrichmentStatus,
      favorited,
      limit,
      offset,
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('GET /api/contacts error:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    // Validate required fields
    if (!body.cardImageUrl || !body.cardImagePath) {
      return NextResponse.json(
        { error: 'Card image URL and path are required' },
        { status: 400 }
      );
    }

    console.log('📥 Contact API received:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      jobTitle: body.jobTitle,
      website: body.website,
      address: body.address,
    });

    const contact = await createContact({
      first_name: body.firstName || undefined,
      last_name: body.lastName || undefined,
      email: body.email || undefined,
      phone: body.phone || undefined,
      company: body.company || undefined,
      job_title: body.jobTitle || undefined,
      company_website: body.website || undefined,
      address: body.address || undefined,
      card_image_url: body.cardImageUrl,
      card_image_path: body.cardImagePath,
      ocr_confidence: body.ocrConfidence || undefined,
      ocr_raw_text: body.ocrRawText || undefined,
      met_at: body.metAt || undefined,
      notes: body.notes || undefined,
      tags: body.tags || undefined,
      // GPS location captured when scanning (for chain store identification)
      scan_latitude: body.scanLatitude || undefined,
      scan_longitude: body.scanLongitude || undefined,
      scan_location_accuracy: body.scanLocationAccuracy || undefined,
    });

    // CRITICAL: Decrement usage after successful contact creation
    // This handles both subscription scans AND credits correctly
    try {
      await decrementUsage(user.id, contact.id, false);
      console.log('✅ Usage decremented for user:', user.id);

      // Check if user just used their last scan (send upgrade reminder email)
      // They had 1 scan remaining AND 0 credits, so this was their last
      const wasLastScan =
        usageCheck.subscription.scansRemaining === 1 &&
        usageCheck.credits.balance === 0;

      if (wasLastScan && user.email) {
        // Send email in background (don't block response)
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        sendScanLimitEmail(user.email, userName).catch((emailError) => {
          console.error('Failed to send scan limit email:', emailError);
        });
        console.log('📧 Queued upgrade reminder email for:', user.email);
      }
    } catch (usageError) {
      console.error('Failed to decrement usage:', usageError);
      // Don't fail the contact creation if usage tracking fails
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('POST /api/contacts error:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
