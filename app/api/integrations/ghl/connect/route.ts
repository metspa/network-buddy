// API endpoint to connect GoHighLevel integration
// POST /api/integrations/ghl/connect

import { NextRequest, NextResponse } from 'next/server';
import { upsertGHLIntegration } from '@/lib/database/ghl-integrations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, locationId, companyId, autoSync, tags } = body;

    // Validate required fields
    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'API Key and Location ID are required' },
        { status: 400 }
      );
    }

    // Create/update integration
    const integration = await upsertGHLIntegration({
      apiKey,
      locationId,
      companyId,
      autoSync,
      tags,
    });

    // Return success (don't expose encrypted API key)
    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        locationId: integration.ghl_location_id,
        companyId: integration.ghl_company_id,
        autoSync: integration.auto_sync,
        tags: integration.sync_tags,
        createdAt: integration.created_at,
      },
    });
  } catch (error) {
    console.error('GHL connect error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid GHL')) {
        return NextResponse.json(
          { error: 'Invalid API Key or Location ID. Please check your credentials.' },
          { status: 401 }
        );
      }

      if (error.message.includes('Not authenticated')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to connect GoHighLevel integration' },
      { status: 500 }
    );
  }
}
