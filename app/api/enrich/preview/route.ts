// Preview enrichment API - fetches GMB data before saving contact
// This gives users immediate feedback about the company while they edit OCR results
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchGoogleMapsBusiness } from '@/lib/services/serpapi-gmb';
import { getCachedData, setCachedData } from '@/lib/enrichment/cache';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company } = await request.json();

    if (!company) {
      return NextResponse.json({ gmb: null });
    }

    // Check cache first (14-day TTL)
    const cacheKey = `gmb:${company}`.toLowerCase().replace(/\s+/g, '_');
    const cached = await getCachedData(cacheKey, 'gmb');

    if (cached) {
      console.log('📦 Returning cached GMB data for:', company);
      return NextResponse.json({
        gmb: {
          name: cached.name,
          rating: cached.rating,
          review_count: cached.review_count,
          reviews: cached.reviews || [],
          photos: cached.photos || [],
          place_id: cached.place_id,
          hours: cached.hours,
          address: cached.address,
          phone: cached.phone,
          website: cached.website,
          categories: cached.categories || [],
          price_range: cached.price_range,
        },
      });
    }

    // Fetch fresh GMB data
    console.log('🔍 Fetching fresh GMB data for:', company);
    const gmbResult = await searchGoogleMapsBusiness(company);

    console.log('📊 GMB Result:', {
      success: gmbResult.success,
      name: gmbResult.name,
      rating: gmbResult.rating,
      reviewCount: gmbResult.review_count,
      reviewsExtracted: gmbResult.reviews?.length || 0,
      photosExtracted: gmbResult.photos?.length || 0,
    });

    if (gmbResult.success) {
      // Cache for 14 days
      await setCachedData(cacheKey, 'gmb', gmbResult, 14);

      return NextResponse.json({
        gmb: {
          name: gmbResult.name,
          rating: gmbResult.rating,
          review_count: gmbResult.review_count,
          reviews: gmbResult.reviews || [],
          photos: gmbResult.photos || [],
          place_id: gmbResult.place_id,
          hours: gmbResult.hours,
          address: gmbResult.address,
          phone: gmbResult.phone,
          website: gmbResult.website,
          categories: gmbResult.categories || [],
          price_range: gmbResult.price_range,
        },
      });
    }

    // No GMB data found
    return NextResponse.json({ gmb: null });
  } catch (error) {
    console.error('Preview enrichment error:', error);

    // Don't fail the request - just return no data
    return NextResponse.json({ gmb: null });
  }
}
