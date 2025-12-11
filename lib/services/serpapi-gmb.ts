// SerpApi Google Maps integration for comprehensive GMB data
// Gets reviews, photos, ratings, and all business information
// Cost: ~$0.01 per lookup
// Speed: 3-5 seconds

export type GMBReview = {
  author: string;
  rating: number; // 1-5
  text: string;
  date: string; // e.g., "2 weeks ago"
  likes: number;
};

export type GMBPhoto = {
  url: string;
  thumbnail: string;
  title?: string;
};

export type SerpApiGMBResult = {
  success: boolean;
  // Basic info
  place_id: string | null;
  name: string | null;
  rating: number | null;
  review_count: number | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  // Detailed reviews (up to 10 most recent)
  reviews: GMBReview[];
  // Business photos
  photos: GMBPhoto[];
  // Additional data
  hours: string | null; // e.g., "Open now · Closes 6 PM"
  categories: string[]; // e.g., ["Roofing contractor", "General contractor"]
  price_range: string | null; // e.g., "$$"
  // Status
  is_open: boolean | null;
  error: string | null;
};

/**
 * Search Google Maps for comprehensive business data using SerpApi
 * Gets reviews, photos, and all GMB information in one call
 *
 * Cost: ~$0.01 per lookup
 * Speed: 3-5 seconds
 *
 * @param businessName - The business name to search for
 * @param location - Optional location string (e.g., "New York, NY")
 * @param coordinates - Optional GPS coordinates for precise location matching (chain stores)
 */
export async function searchGoogleMapsBusiness(
  businessName: string,
  location?: string,
  coordinates?: { latitude: number; longitude: number }
): Promise<SerpApiGMBResult> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_API_KEY not configured, GMB data unavailable');
    return {
      success: false,
      place_id: null,
      name: null,
      rating: null,
      review_count: null,
      address: null,
      phone: null,
      website: null,
      reviews: [],
      photos: [],
      hours: null,
      categories: [],
      price_range: null,
      is_open: null,
      error: 'SerpApi not configured',
    };
  }

  try {
    // Build search query
    const query = location ? `${businessName} ${location}` : businessName;

    // SerpApi Google Maps search
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.set('engine', 'google_maps');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'search');
    searchUrl.searchParams.set('api_key', apiKey);

    // Add GPS coordinates for precise location matching (e.g., which Shake Shack location)
    if (coordinates) {
      // Format: @latitude,longitude,zoom (zoom 15 = ~1km radius)
      const ll = `@${coordinates.latitude},${coordinates.longitude},15z`;
      searchUrl.searchParams.set('ll', ll);
      console.log('📍 Using GPS coordinates for GMB search:', ll);
    }

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`SerpApi error (${searchResponse.status}): ${errorText}`);
    }

    const searchData = await searchResponse.json();

    // Get first result (most relevant)
    const place = searchData.local_results?.[0];

    if (!place) {
      return {
        success: false,
        place_id: null,
        name: null,
        rating: null,
        review_count: null,
        address: null,
        phone: null,
        website: null,
        reviews: [],
        photos: [],
        hours: null,
        categories: [],
        price_range: null,
        is_open: null,
        error: 'Business not found on Google Maps',
      };
    }

    // Get detailed place data (reviews, photos, etc.)
    let reviews: GMBReview[] = [];
    let photos: GMBPhoto[] = [];

    console.log('🔍 GMB Search Result:', {
      place_id: place.place_id,
      data_id: place.data_id,
      title: place.title,
      rating: place.rating,
      reviews: place.reviews,
    });

    if (place.place_id || place.data_id) {
      const detailsUrl = new URL('https://serpapi.com/search.json');
      detailsUrl.searchParams.set('engine', 'google_maps');
      detailsUrl.searchParams.set('type', 'place');
      detailsUrl.searchParams.set('data_id', place.data_id || place.place_id);
      detailsUrl.searchParams.set('api_key', apiKey);

      console.log('📡 Fetching GMB details with data_id:', place.data_id || place.place_id);

      try {
        const detailsResponse = await fetch(detailsUrl.toString());
        const detailsData = await detailsResponse.json();

        console.log('📊 GMB Details Response:', {
          hasReviews: !!detailsData.reviews,
          reviewCount: detailsData.reviews?.length || 0,
          hasPhotos: !!detailsData.photos,
          photoCount: detailsData.photos?.length || 0,
        });

        // Extract reviews
        if (detailsData.reviews) {
          reviews = detailsData.reviews.slice(0, 10).map((review: any) => ({
            author: review.user?.name || 'Anonymous',
            rating: review.rating || 0,
            text: review.snippet || review.text || '',
            date: review.date || '',
            likes: review.likes || 0,
          }));
          console.log(`✅ Extracted ${reviews.length} reviews`);
        } else {
          console.log('⚠️ No reviews in details response');
        }

        // Extract photos
        if (detailsData.photos) {
          photos = detailsData.photos.slice(0, 20).map((photo: any) => ({
            url: photo.image || photo.link || '',
            thumbnail: photo.thumbnail || photo.image || '',
            title: photo.title || undefined,
          }));
          console.log(`✅ Extracted ${photos.length} photos`);
        } else {
          console.log('⚠️ No photos in details response');
        }
      } catch (detailsError) {
        console.warn('❌ Failed to get place details:', detailsError);
        // Continue with basic data from search results
      }
    } else {
      console.log('⚠️ No place_id or data_id available for details lookup');
    }

    return {
      success: true,
      place_id: place.place_id || null,
      name: place.title || place.name || null,
      rating: place.rating || null,
      review_count: place.reviews || place.user_ratings_total || null,
      address: place.address || null,
      phone: place.phone || null,
      website: place.website || null,
      reviews,
      photos,
      hours: place.hours || place.opening_hours?.current_status || null,
      categories: place.type ? [place.type] : [],
      price_range: place.price || null,
      is_open: place.open_state === 'Open' || null,
      error: null,
    };
  } catch (error) {
    console.error('SerpApi Google Maps error:', error);

    return {
      success: false,
      place_id: null,
      name: null,
      rating: null,
      review_count: null,
      address: null,
      phone: null,
      website: null,
      reviews: [],
      photos: [],
      hours: null,
      categories: [],
      price_range: null,
      is_open: null,
      error: error instanceof Error ? error.message : 'Failed to search Google Maps',
    };
  }
}

/**
 * Check if we got comprehensive GMB data
 */
export function hasGMBData(result: SerpApiGMBResult): boolean {
  return !!(
    result.success &&
    (result.reviews.length > 0 || result.photos.length > 0 || result.rating)
  );
}

/**
 * Get summary of GMB data for logging/display
 */
export function getGMBSummary(result: SerpApiGMBResult): string {
  if (!result.success) {
    return 'No GMB data found';
  }

  const parts: string[] = [];

  if (result.rating) {
    parts.push(`${result.rating.toFixed(1)} stars`);
  }

  if (result.review_count) {
    parts.push(`${result.review_count} reviews`);
  }

  if (result.reviews.length > 0) {
    parts.push(`${result.reviews.length} detailed reviews`);
  }

  if (result.photos.length > 0) {
    parts.push(`${result.photos.length} photos`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Basic info only';
}

/**
 * Calculate review sentiment score (0-100)
 * Based on distribution of ratings in detailed reviews
 */
export function calculateReviewSentiment(reviews: GMBReview[]): number {
  if (reviews.length === 0) return 50; // Neutral

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;

  // Convert 1-5 scale to 0-100
  return ((avgRating - 1) / 4) * 100;
}

/**
 * Get most helpful review (highest likes)
 */
export function getMostHelpfulReview(reviews: GMBReview[]): GMBReview | null {
  if (reviews.length === 0) return null;

  return reviews.reduce((best, current) =>
    current.likes > best.likes ? current : best
  );
}

/**
 * Get recent positive reviews (4-5 stars, from last 3 months)
 */
export function getRecentPositiveReviews(reviews: GMBReview[]): GMBReview[] {
  return reviews.filter(review => {
    // Rating filter
    if (review.rating < 4) return false;

    // Recency filter (simple check for "week" or "day" in date)
    const date = review.date.toLowerCase();
    return date.includes('day') || date.includes('week') || date.includes('hour');
  });
}
