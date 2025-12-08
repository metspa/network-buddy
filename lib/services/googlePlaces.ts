// Google Places API Integration - Search businesses and get reputation data

export type GooglePlacesResult = {
  success: boolean;
  placeId: string | null;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  isActive: boolean;
  error: string | null;
};

/**
 * Search for a business using Google Places API
 * Performs Text Search followed by Place Details for comprehensive data
 *
 * Cost: ~$0.034 per lookup (Text Search + Place Details)
 */
export async function searchGooglePlaces(
  businessName: string,
  location?: string
): Promise<GooglePlacesResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return {
      success: false,
      placeId: null,
      rating: null,
      reviewCount: null,
      address: null,
      phone: null,
      website: null,
      isActive: false,
      error: 'Google Places API not configured',
    };
  }

  try {
    // Step 1: Text Search to find the business
    const searchQuery = location ? `${businessName} ${location}` : businessName;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery
    )}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    // Check for API errors
    if (searchData.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied:', searchData.error_message);
      return {
        success: false,
        placeId: null,
        rating: null,
        reviewCount: null,
        address: null,
        phone: null,
        website: null,
        isActive: false,
        error: 'API access denied. Check API key and billing.',
      };
    }

    if (searchData.status !== 'OK' || !searchData.results?.[0]) {
      return {
        success: false,
        placeId: null,
        rating: null,
        reviewCount: null,
        address: null,
        phone: null,
        website: null,
        isActive: false,
        error: 'Business not found on Google',
      };
    }

    const place = searchData.results[0];

    // Step 2: Get Place Details for comprehensive information
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
      place.place_id
    }&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,business_status&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      // Return basic data from text search if details fail
      return {
        success: true,
        placeId: place.place_id,
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || null,
        address: place.formatted_address || null,
        phone: null,
        website: null,
        isActive: true,
        error: null,
      };
    }

    const details = detailsData.result;

    return {
      success: true,
      placeId: place.place_id,
      rating: details.rating || null,
      reviewCount: details.user_ratings_total || null,
      address: details.formatted_address || null,
      phone: details.formatted_phone_number || null,
      website: details.website || null,
      isActive: details.business_status === 'OPERATIONAL',
      error: null,
    };
  } catch (error) {
    console.error('Google Places API error:', error);

    return {
      success: false,
      placeId: null,
      rating: null,
      reviewCount: null,
      address: null,
      phone: null,
      website: null,
      isActive: false,
      error: error instanceof Error ? error.message : 'Failed to search Google Places',
    };
  }
}

/**
 * Format rating for display (e.g., "4.5" or "N/A")
 */
export function formatRating(rating: number | null): string {
  if (rating === null) return 'N/A';
  return rating.toFixed(1);
}

/**
 * Format review count for display (e.g., "123 reviews" or "1 review" or "No reviews")
 */
export function formatReviewCount(count: number | null): string {
  if (count === null || count === 0) return 'No reviews';
  if (count === 1) return '1 review';
  return `${count} reviews`;
}

/**
 * Get reputation level based on rating
 */
export function getReputationLevel(
  rating: number | null,
  reviewCount: number | null
): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
  if (rating === null) return 'unknown';

  if (rating >= 4.5 && reviewCount && reviewCount >= 20) return 'excellent';
  if (rating >= 4.0) return 'good';
  if (rating >= 3.0) return 'fair';
  return 'poor';
}
