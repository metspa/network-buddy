// Debug endpoint to list all contacts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, company, email, phone, reputation_score, review_count, enrichment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({
      count: contacts?.length || 0,
      contacts: contacts?.map(c => ({
        id: c.id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'No name',
        company: c.company || 'No company',
        email: c.email || 'No email',
        phone: c.phone || 'No phone',
        rating: c.reputation_score,
        reviewCount: c.review_count,
        status: c.enrichment_status,
        created: c.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
