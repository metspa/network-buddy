// API endpoint to disconnect GoHighLevel integration
// DELETE /api/integrations/ghl/disconnect

import { NextRequest, NextResponse } from 'next/server';
import { deleteGHLIntegration } from '@/lib/database/ghl-integrations';

export async function DELETE(request: NextRequest) {
  try {
    await deleteGHLIntegration();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GHL disconnect error:', error);

    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to disconnect GoHighLevel integration' },
      { status: 500 }
    );
  }
}
