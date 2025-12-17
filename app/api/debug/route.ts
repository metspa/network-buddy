// DEBUG ENDPOINT - Check database schema and API connectivity
// DELETE THIS FILE AFTER DEBUGGING
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // 1. Check environment variables
  results.checks.envVars = {
    SERPAPI_API_KEY: process.env.SERPAPI_API_KEY ? `Set (${process.env.SERPAPI_API_KEY.slice(0, 8)}...)` : 'NOT SET',
    SERPER_API_KEY: process.env.SERPER_API_KEY ? `Set (${process.env.SERPER_API_KEY.slice(0, 8)}...)` : 'NOT SET',
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? `Set (${process.env.PERPLEXITY_API_KEY.slice(0, 8)}...)` : 'NOT SET',
    APOLLO_API_KEY: process.env.APOLLO_API_KEY ? `Set (${process.env.APOLLO_API_KEY.slice(0, 8)}...)` : 'NOT SET',
  };

  // 2. Check database schema (using service role to bypass RLS)
  try {
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get one contact and check what columns exist
    const { data: contacts, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .limit(1);

    if (error) {
      results.checks.database = { error: error.message };
    } else if (contacts && contacts.length > 0) {
      const contact = contacts[0];
      results.checks.database = {
        status: 'Connected',
        contactId: contact.id,
        contactData: {
          firstName: contact.first_name,
          lastName: contact.last_name,
          company: contact.company,
          email: contact.email,
          enrichmentStatus: contact.enrichment_status,
          enrichmentError: contact.enrichment_error,
        },
        criticalColumns: {
          social_media: contact.social_media ? JSON.stringify(contact.social_media).slice(0, 100) : 'null',
          gmb_reviews: contact.gmb_reviews ? `${contact.gmb_reviews.length} reviews` : 'null',
          gmb_photos: contact.gmb_photos ? `${contact.gmb_photos.length} photos` : 'null',
          linkedin_url: contact.linkedin_url || 'null',
          company_description: contact.company_description ? contact.company_description.slice(0, 50) + '...' : 'null',
          reputation_score: contact.reputation_score || 'null',
          review_count: contact.review_count || 'null',
        },
      };
    } else {
      results.checks.database = { status: 'No contacts found' };
    }
  } catch (err) {
    results.checks.database = { error: String(err) };
  }

  // 3. Test SerpApi (GMB)
  try {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (apiKey) {
      const testUrl = new URL('https://serpapi.com/search.json');
      testUrl.searchParams.set('engine', 'google_maps');
      testUrl.searchParams.set('q', 'Starbucks New York');
      testUrl.searchParams.set('type', 'search');
      testUrl.searchParams.set('api_key', apiKey);

      const response = await fetch(testUrl.toString());
      const data = await response.json();

      results.checks.serpapi = {
        status: response.ok ? 'Working' : 'Error',
        statusCode: response.status,
        hasResults: !!data.local_results?.length,
        resultCount: data.local_results?.length || 0,
        firstResult: data.local_results?.[0]?.title || 'No results',
        error: data.error || null,
      };
    } else {
      results.checks.serpapi = { status: 'API key not set' };
    }
  } catch (err) {
    results.checks.serpapi = { error: String(err) };
  }

  // 4. Test Serper (LinkedIn search)
  try {
    const apiKey = process.env.SERPER_API_KEY;
    if (apiKey) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'John Smith site:linkedin.com/in',
          num: 1,
        }),
      });

      const data = await response.json();

      results.checks.serper = {
        status: response.ok ? 'Working' : 'Error',
        statusCode: response.status,
        hasResults: !!data.organic?.length,
        resultCount: data.organic?.length || 0,
        error: data.error || null,
      };
    } else {
      results.checks.serper = { status: 'API key not set' };
    }
  } catch (err) {
    results.checks.serper = { error: String(err) };
  }

  return NextResponse.json(results, { status: 200 });
}
