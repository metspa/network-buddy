import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate and sanitize inputs
    const updates: Record<string, string | null> = {};

    if ('nickname' in body) {
      updates.nickname = body.nickname?.trim() || null;
    }
    if ('occupation' in body) {
      updates.occupation = body.occupation?.trim() || null;
    }
    if ('about_me' in body) {
      updates.about_me = body.about_me?.trim() || null;
    }
    if ('company_name' in body) {
      updates.company_name = body.company_name?.trim() || null;
    }
    if ('industry' in body) {
      updates.industry = body.industry?.trim() || null;
    }
    if ('communication_tone' in body) {
      const validTones = ['professional', 'friendly', 'casual'];
      updates.communication_tone = validTones.includes(body.communication_tone)
        ? body.communication_tone
        : 'professional';
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating personalization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Personalization API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, occupation, about_me, company_name, industry, communication_tone')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching personalization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Personalization API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
