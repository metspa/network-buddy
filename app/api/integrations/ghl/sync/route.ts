// API endpoint to manually sync a contact to GoHighLevel
// POST /api/integrations/ghl/sync

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncContactToGHL } from '@/lib/services/gohighlevel';
import { updateContact } from '@/lib/database/contacts';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
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

    // Trigger sync
    const result = await syncContactToGHL(contactId);

    if (result.success && result.ghlContactId) {
      // Update contact with sync status
      await updateContact(contactId, {
        ghl_contact_id: result.ghlContactId,
        ghl_synced_at: new Date().toISOString(),
        ghl_sync_error: null,
      });

      return NextResponse.json({
        success: true,
        ghlContactId: result.ghlContactId,
        syncedAt: new Date().toISOString(),
      });
    } else {
      // Store error
      if (result.error) {
        await updateContact(contactId, {
          ghl_sync_error: JSON.stringify({
            message: result.error,
            errorCode: result.errorCode,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Sync failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('GHL sync API error:', error);

    return NextResponse.json(
      { error: 'Failed to sync contact to GoHighLevel' },
      { status: 500 }
    );
  }
}
