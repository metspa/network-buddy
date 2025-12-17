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
 * Generate search variations for a business name
 * Helps find businesses when exact name doesn't match
 */
function generateNameVariations(name: string): string[] {
  const variations: string[] = [name];

  // Remove common suffixes
  const suffixPatterns = [
    /,?\s*(Inc\.?|LLC|Corp\.?|Company|Co\.?|Ltd\.?|L\.?L\.?C\.?)$/i,
    /,?\s*&\s*(Sons?|Associates?|Partners?)$/i,
  ];

  let simplified = name;
  for (const pattern of suffixPatterns) {
    simplified = simplified.replace(pattern, '').trim();
  }
  if (simplified !== name) {
    variations.push(simplified);
  }

  // Remove "The" prefix
  if (name.toLowerCase().startsWith('the ')) {
    variations.push(name.slice(4));
  }

  // DON'T add single-word variations - they're too loose and match wrong businesses
  // Only use the full name and slightly simplified versions

  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Get location hint from phone area code
 * Returns city/state based on common area codes
 */
function getLocationFromAreaCode(phone: string | null): string | null {
  if (!phone) return null;

  // Extract area code (first 3 digits)
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 3) return null;

  const areaCode = digits.slice(0, 3);

  // Map of common area codes to cities
  const areaCodeMap: Record<string, string> = {
    // New York
    '212': 'New York, NY',
    '646': 'New York, NY',
    '718': 'New York, NY',
    '917': 'New York, NY',
    '347': 'New York, NY',
    '929': 'New York, NY',
    '516': 'Long Island, NY',
    '631': 'Long Island, NY',
    '914': 'Westchester, NY',
    // California
    '213': 'Los Angeles, CA',
    '310': 'Los Angeles, CA',
    '323': 'Los Angeles, CA',
    '818': 'Los Angeles, CA',
    '424': 'Los Angeles, CA',
    '415': 'San Francisco, CA',
    '408': 'San Jose, CA',
    '619': 'San Diego, CA',
    // Texas
    '214': 'Dallas, TX',
    '713': 'Houston, TX',
    '512': 'Austin, TX',
    '210': 'San Antonio, TX',
    // Florida
    '305': 'Miami, FL',
    '786': 'Miami, FL',
    '954': 'Fort Lauderdale, FL',
    '407': 'Orlando, FL',
    '813': 'Tampa, FL',
    // Illinois
    '312': 'Chicago, IL',
    '773': 'Chicago, IL',
    '872': 'Chicago, IL',
    // Others
    '202': 'Washington, DC',
    '617': 'Boston, MA',
    '206': 'Seattle, WA',
    '404': 'Atlanta, GA',
    '602': 'Phoenix, AZ',
    '303': 'Denver, CO',
  };

  return areaCodeMap[areaCode] || null;
}

// Export location helper for use in enrichment pipeline
export { getLocationFromAreaCode };

/**
 * Search Google Maps for comprehensive business data using SerpApi
 * Gets reviews, photos, and all GMB information in one call
 * Now tries multiple name variations if exact match fails
 *
 * Cost: ~$0.01 per lookup (may use 2-3 lookups for variations)
 * Speed: 3-8 seconds
 *
 * @param businessName - The business name to search for
 * @param location - Optional location string (e.g., "New York, NY")
 * @param coordinates - Optional GPS coordinates for precise location matching (chain stores)
 * @param phone - Optional phone number to extract location from area code
 */
export async function searchGoogleMapsBusiness(
  businessName: string,
  location?: string,
  coordinates?: { latitude: number; longitude: number },
  phone?: string
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
    // Generate name variations to try
    const nameVariations = generateNameVariations(businessName);
    console.log(`🔍 GMB search variations for "${businessName}":`, nameVariations);

    // Use provided location, or try to detect from phone area code
    const effectiveLocation = location || getLocationFromAreaCode(phone || null);
    if (effectiveLocation) {
      console.log(`📍 Using location: ${effectiveLocation}${phone ? ` (from phone ${phone})` : ''}`);
    }

    let place: any = null;
    let searchData: any = null;
    let successfulQuery = '';

    // Try each variation until we find a result
    for (const variation of nameVariations) {
      const query = effectiveLocation ? `${variation} ${effectiveLocation}` : variation;
      console.log(`  Trying: "${query}"`);

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
        console.warn(`  ⚠️ SerpApi error for "${variation}": ${searchResponse.status}`);
        continue; // Try next variation
      }

      searchData = await searchResponse.json();
      place = searchData.local_results?.[0];

      if (place) {
        successfulQuery = query;
        console.log(`  ✅ Found result with "${variation}": ${place.title}`);
        break; // Found a result!
      } else {
        console.log(`  ❌ No results for "${variation}"`);
      }
    }

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
        error: `Business not found on Google Maps (tried: ${nameVariations.join(', ')})`,
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

    const dataId = place.data_id || place.place_id;

    if (dataId) {
      // Use google_maps_reviews engine for detailed reviews
      const reviewsUrl = new URL('https://serpapi.com/search.json');
      reviewsUrl.searchParams.set('engine', 'google_maps_reviews');
      reviewsUrl.searchParams.set('data_id', dataId);
      reviewsUrl.searchParams.set('api_key', apiKey);

      console.log('📡 Fetching GMB reviews with data_id:', dataId);

      try {
        const reviewsResponse = await fetch(reviewsUrl.toString());
        const reviewsData = await reviewsResponse.json();

        console.log('📊 GMB Reviews Response keys:', Object.keys(reviewsData));

        // Reviews are in reviewsData.reviews
        if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
          reviews = reviewsData.reviews.slice(0, 10).map((review: any) => ({
            author: review.user?.name || 'Anonymous',
            rating: review.rating || 0,
            text: review.snippet || review.extracted_snippet?.original || '',
            date: review.date || '',
            likes: review.likes || 0,
          }));
          console.log(`✅ Extracted ${reviews.length} reviews from google_maps_reviews`);
        } else {
          console.log('⚠️ No reviews array in response');
        }

        // Photos can be in individual reviews or we need to fetch separately
        // For now, collect photos from reviews that have them
        const reviewPhotos: GMBPhoto[] = [];
        for (const review of (reviewsData.reviews || []).slice(0, 10)) {
          if (review.images && Array.isArray(review.images)) {
            for (const img of review.images.slice(0, 3)) {
              reviewPhotos.push({
                url: img,
                thumbnail: img,
                title: `Photo by ${review.user?.name || 'reviewer'}`,
              });
            }
          }
        }
        if (reviewPhotos.length > 0) {
          photos = reviewPhotos.slice(0, 20);
          console.log(`✅ Extracted ${photos.length} photos from reviews`);
        }

      } catch (detailsError) {
        console.warn('❌ Failed to get reviews:', detailsError);
        // Continue with basic data from search results
      }
    } else {
      console.log('⚠️ No data_id available for reviews lookup');
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
