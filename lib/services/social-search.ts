// Social media profile search using Serper API
// Searches Twitter, Instagram, Facebook, TikTok in parallel
// Cost: ~$0.0003 per platform search
// Speed: 2 seconds total (all platforms in parallel)

export type SocialMediaProfiles = {
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  linkedin_company: string | null;
};

// Track if we've already logged the API key warning
let serperKeyWarningLogged = false;

/**
 * Search for a single social media platform profile
 */
async function searchSocialPlatform(
  companyName: string,
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin',
  siteDomain: string
): Promise<string | null> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      if (!serperKeyWarningLogged) {
        console.error('❌ SERPER_API_KEY not set - Social media search disabled');
        console.error('   Get your API key at https://serper.dev (different from SerpApi!)');
        serperKeyWarningLogged = true;
      }
      return null;
    }

    const query = `"${companyName}" site:${siteDomain}`;

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 3, // Get top 3 results
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Serper API error for ${platform} (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();

    // Extract first result
    const firstResult = data.organic?.[0];

    if (!firstResult || !firstResult.link) {
      return null;
    }

    // Validate the URL is actually for this platform
    if (!firstResult.link.includes(siteDomain)) {
      return null;
    }

    return firstResult.link;
  } catch (error) {
    console.error(`${platform} search error:`, error);
    return null;
  }
}

/**
 * Search for all social media profiles in parallel
 * Much faster than sequential searches (2 sec vs 10 sec)
 */
export async function searchAllSocialProfiles(
  companyName: string
): Promise<SocialMediaProfiles> {
  try {
    // Execute all searches in parallel
    const [twitter, instagram, facebook, tiktok, linkedin_company] = await Promise.all([
      searchSocialPlatform(companyName, 'twitter', 'twitter.com'),
      searchSocialPlatform(companyName, 'instagram', 'instagram.com'),
      searchSocialPlatform(companyName, 'facebook', 'facebook.com'),
      searchSocialPlatform(companyName, 'tiktok', 'tiktok.com'),
      searchSocialPlatform(companyName, 'linkedin', 'linkedin.com/company'),
    ]);

    return {
      twitter,
      instagram,
      facebook,
      tiktok,
      linkedin_company,
    };
  } catch (error) {
    console.error('Social media search error:', error);

    // Return empty on error (graceful degradation)
    return {
      twitter: null,
      instagram: null,
      facebook: null,
      tiktok: null,
      linkedin_company: null,
    };
  }
}

/**
 * Check if we found any social profiles
 */
export function hasSocialProfiles(profiles: SocialMediaProfiles): boolean {
  return !!(
    profiles.twitter ||
    profiles.instagram ||
    profiles.facebook ||
    profiles.tiktok ||
    profiles.linkedin_company
  );
}

/**
 * Count how many social profiles were found
 */
export function countSocialProfiles(profiles: SocialMediaProfiles): number {
  let count = 0;
  if (profiles.twitter) count++;
  if (profiles.instagram) count++;
  if (profiles.facebook) count++;
  if (profiles.tiktok) count++;
  if (profiles.linkedin_company) count++;
  return count;
}
