// Debug endpoint to see raw SerpApi GMB response
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'Shake Shack NYC';

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'SERPAPI_API_KEY not set' });
  }

  try {
    // Step 1: Search for the business
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.set('engine', 'google_maps');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'search');
    searchUrl.searchParams.set('api_key', apiKey);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    const place = searchData.local_results?.[0];
    if (!place) {
      return NextResponse.json({
        error: 'No results found',
        query,
        searchKeys: Object.keys(searchData),
      });
    }

    // Step 2: Get place details
    const dataId = place.data_id || place.place_id;
    if (!dataId) {
      return NextResponse.json({
        error: 'No data_id found',
        place: {
          title: place.title,
          rating: place.rating,
          reviews: place.reviews,
        },
      });
    }

    // Try the google_maps_reviews engine instead
    const reviewsUrl = new URL('https://serpapi.com/search.json');
    reviewsUrl.searchParams.set('engine', 'google_maps_reviews');
    reviewsUrl.searchParams.set('data_id', dataId);
    reviewsUrl.searchParams.set('api_key', apiKey);

    const reviewsResponse = await fetch(reviewsUrl.toString());
    const detailsData = await reviewsResponse.json();

    // Return structured response showing what's available
    return NextResponse.json({
      query,
      searchResult: {
        title: place.title,
        rating: place.rating,
        reviewCount: place.reviews,
        data_id: place.data_id,
        place_id: place.place_id,
      },
      detailsError: detailsData.error || null,
      detailsResponseKeys: Object.keys(detailsData),
      // Check various possible review locations
      reviewLocations: {
        'detailsData.reviews': Array.isArray(detailsData.reviews) ? detailsData.reviews.length : typeof detailsData.reviews,
        'detailsData.user_reviews': Array.isArray(detailsData.user_reviews) ? detailsData.user_reviews.length : typeof detailsData.user_reviews,
        'detailsData.place_results?.reviews': detailsData.place_results?.reviews ? (Array.isArray(detailsData.place_results.reviews) ? detailsData.place_results.reviews.length : typeof detailsData.place_results.reviews) : 'undefined',
        'detailsData.place_results?.user_reviews': detailsData.place_results?.user_reviews ? (Array.isArray(detailsData.place_results.user_reviews) ? detailsData.place_results.user_reviews.length : typeof detailsData.place_results.user_reviews) : 'undefined',
      },
      // Sample review if found
      sampleReview: detailsData.reviews?.[0] || detailsData.user_reviews?.[0] || detailsData.place_results?.reviews?.[0] || null,
      // Photo locations
      photoLocations: {
        'detailsData.photos': Array.isArray(detailsData.photos) ? detailsData.photos.length : typeof detailsData.photos,
        'detailsData.images': Array.isArray(detailsData.images) ? detailsData.images.length : typeof detailsData.images,
        'detailsData.place_results?.photos': detailsData.place_results?.photos ? (Array.isArray(detailsData.place_results.photos) ? detailsData.place_results.photos.length : typeof detailsData.place_results.photos) : 'undefined',
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
