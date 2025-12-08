// API endpoints for individual contact operations
import { NextRequest, NextResponse } from 'next/server';
import { getContact, updateContact, deleteContact } from '@/lib/database/contacts';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/contacts/:id
 * Fetch a single contact by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const contact = await getContact(id);
    return NextResponse.json(contact);
  } catch (error) {
    const { id } = await context.params;
    console.error(`GET /api/contacts/${id} error:`, error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Failed to fetch contact')) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

/**
 * PATCH /api/contacts/:id
 * Update a contact
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Build update object with only provided fields
    const updates: any = {};

    if (body.first_name !== undefined) updates.first_name = body.first_name;
    if (body.last_name !== undefined) updates.last_name = body.last_name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.company !== undefined) updates.company = body.company;
    if (body.job_title !== undefined) updates.job_title = body.job_title;
    if (body.met_at !== undefined) updates.met_at = body.met_at;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.favorited !== undefined) updates.favorited = body.favorited;

    // Validate at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const contact = await updateContact(id, updates);
    return NextResponse.json(contact);
  } catch (error) {
    const { id } = await context.params;
    console.error(`PATCH /api/contacts/${id} error:`, error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Failed to update contact')) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    await deleteContact(id);
    return NextResponse.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    const { id } = await context.params;
    console.error(`DELETE /api/contacts/${id} error:`, error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Failed to delete contact')) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
