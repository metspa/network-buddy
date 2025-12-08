// API endpoints for contacts CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { getContacts, createContact } from '@/lib/database/contacts';

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
    const body = await request.json();

    // Validate required fields
    if (!body.cardImageUrl || !body.cardImagePath) {
      return NextResponse.json(
        { error: 'Card image URL and path are required' },
        { status: 400 }
      );
    }

    const contact = await createContact({
      first_name: body.firstName || undefined,
      last_name: body.lastName || undefined,
      email: body.email || undefined,
      phone: body.phone || undefined,
      company: body.company || undefined,
      job_title: body.jobTitle || undefined,
      card_image_url: body.cardImageUrl,
      card_image_path: body.cardImagePath,
      ocr_confidence: body.ocrConfidence || undefined,
      ocr_raw_text: body.ocrRawText || undefined,
      met_at: body.metAt || undefined,
      notes: body.notes || undefined,
      tags: body.tags || undefined,
    });

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
