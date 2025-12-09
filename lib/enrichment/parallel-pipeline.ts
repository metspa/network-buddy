// PRIORITIZED Parallel enrichment pipeline
// Phase 1: GMB (reviews, photos) - PRIORITY (3-5 sec)
// Phase 2: LinkedIn (2-3 sec)
// Phase 3: Deep research (Perplexity, social, news) - PARALLEL (5-10 sec)
// Total: 10-18 seconds | User sees reviews/photos after 3-5 seconds!

import { getContact, updateContact } from '@/lib/database/contacts';
import { searchLinkedInProfile, searchCompanyInfo, searchCompanyNews } from '@/lib/services/serper';
import { generateContactSummary, generateReputationInsight, UserPersonalization } from '@/lib/services/openai';
import { detectServiceProvider } from '@/lib/services/serviceProviderDetection';
import { researchCompanyWithPerplexity, PerplexityCompanyData } from '@/lib/services/perplexity';
import { searchAllSocialProfiles, SocialMediaProfiles } from '@/lib/services/social-search';
import { searchGoogleMapsBusiness, SerpApiGMBResult, GMBReview, GMBPhoto } from '@/lib/services/serpapi-gmb';
import {
  getCachedData,
  setCachedData,
  getLinkedInCacheKey,
  getCompanyCacheKey,
  getNewsCacheKey,
} from './cache';

export type ParallelEnrichmentResult = {
  success: boolean;
  // Phase 1: GMB data (PRIORITY - shown first to user)
  gmbData: SerpApiGMBResult | null;
  gmbReviews: GMBReview[];
  gmbPhotos: GMBPhoto[];
  reputationScore: number | null;
  reviewCount: number | null;
  // Phase 2: LinkedIn
  linkedInUrl: string | null;
  // Phase 3: Deep research
  companyWebsite: string | null;
  companyIndustry: string | null;
  recentNews: string[];
  perplexityData: PerplexityCompanyData | null;
  socialProfiles: SocialMediaProfiles | null;
  // Service provider detection
  isServiceProvider: boolean;
  serviceCategory: string | null;
  reputationSummary: string | null;
  // AI insights
  aiSummary: string | null;
  icebreakers: string[];
  smsTemplates: { message: string }[];
  emailTemplates: { subject: string; body: string }[];
  // Error tracking
  error: string | null;
};

export type EnrichmentProgressCallback = (phase: string, message: string, data?: any) => void;

/**
 * PHASE 1: GOOGLE MY BUSINESS (PRIORITY - 3-5 sec)
 * Get reviews, photos, reputation - show to user immediately
 */
async function phase1_gmb(
  company: string | null,
  location: string | null,
  onProgress?: EnrichmentProgressCallback
): Promise<SerpApiGMBResult | null> {
  if (!company) {
    return null;
  }

  onProgress?.('gmb', `Getting ${company}'s Google reviews and photos...`);

  const cacheKey = `gmb:${company}`.toLowerCase().replace(/\s+/g, '_');
  const cached = await getCachedData(cacheKey, 'gmb');

  if (cached) {
    onProgress?.('gmb', `Found ${cached.reviews?.length || 0} reviews and ${cached.photos?.length || 0} photos (cached)`, {
      rating: cached.rating,
      reviewCount: cached.review_count,
    });
    return cached;
  }

  const result = await searchGoogleMapsBusiness(company, location || undefined);

  if (result.success) {
    // Cache for 14 days (GMB data changes, but not too frequently)
    await setCachedData(cacheKey, 'gmb', result, 14);

    onProgress?.('gmb', `Found ${result.reviews.length} detailed reviews and ${result.photos.length} photos!`, {
      rating: result.rating,
      reviewCount: result.review_count,
      hasPhotos: result.photos.length > 0,
    });
  } else {
    onProgress?.('gmb', 'No Google My Business data found');
  }

  return result;
}

/**
 * PHASE 2: LINKEDIN PROFILE (2-3 sec)
 */
async function phase2_linkedin(
  firstName: string | null,
  lastName: string | null,
  company: string | null,
  onProgress?: EnrichmentProgressCallback
): Promise<{ url: string | null; snippet: string | null }> {
  if (!firstName || !lastName) {
    return { url: null, snippet: null };
  }

  onProgress?.('linkedin', `Searching for ${firstName} ${lastName} on LinkedIn...`);

  const cacheKey = getLinkedInCacheKey(firstName, lastName, company || undefined);
  const cached = await getCachedData(cacheKey, 'linkedin');

  if (cached) {
    onProgress?.('linkedin', 'Found LinkedIn profile (cached)', { url: cached.url });
    return cached;
  }

  const result = await searchLinkedInProfile(firstName, lastName, company || undefined);

  if (result.url) {
    await setCachedData(cacheKey, 'linkedin', result);
    onProgress?.('linkedin', 'LinkedIn profile found!', { url: result.url });
  } else {
    onProgress?.('linkedin', 'No LinkedIn profile found');
  }

  return result;
}

/**
 * PHASE 3: DEEP RESEARCH (5-10 sec, all parallel)
 * Perplexity + News + Social + Company info
 */
async function phase3_deep(
  company: string | null,
  website: string | null,
  onProgress?: EnrichmentProgressCallback
): Promise<{
  perplexityData: PerplexityCompanyData | null;
  news: string[];
  socialProfiles: SocialMediaProfiles | null;
  companyInfo: any;
}> {
  if (!company) {
    return {
      perplexityData: null,
      news: [],
      socialProfiles: null,
      companyInfo: null,
    };
  }

  onProgress?.('deep', 'Starting deep company research...');

  // Execute ALL in parallel
  const [perplexityData, news, socialProfiles, companyInfo] = await Promise.all([
    // Perplexity AI deep research
    (async () => {
      const cacheKey = `perplexity:${company}`.toLowerCase().replace(/\s+/g, '_');
      const cached = await getCachedData(cacheKey, 'perplexity');

      if (cached) {
        onProgress?.('deep', 'Deep research found (cached)');
        return cached;
      }

      onProgress?.('deep', 'Researching with Perplexity AI...');
      const result = await researchCompanyWithPerplexity(company, website);

      if (result.company_description || result.company_size) {
        await setCachedData(cacheKey, 'perplexity', result, 30); // 30-day cache
      }

      onProgress?.('deep', 'Perplexity research complete');
      return result;
    })(),

    // Company news
    (async () => {
      const cacheKey = getNewsCacheKey(company);
      const cached = await getCachedData(cacheKey, 'news');

      if (cached) {
        onProgress?.('deep', `Found ${cached.length} news articles (cached)`);
        return cached;
      }

      onProgress?.('deep', 'Searching company news...');
      const result = await searchCompanyNews(company);

      if (result.length > 0) {
        await setCachedData(cacheKey, 'news', result, 7); // 7-day cache
        onProgress?.('deep', `Found ${result.length} news articles`);
      }

      return result;
    })(),

    // Social media profiles
    (async () => {
      const cacheKey = `social:${company}`.toLowerCase().replace(/\s+/g, '_');
      const cached = await getCachedData(cacheKey, 'social');

      if (cached) {
        onProgress?.('deep', 'Social profiles found (cached)');
        return cached;
      }

      onProgress?.('deep', 'Searching social media...');
      const result = await searchAllSocialProfiles(company);

      if (result.twitter || result.instagram || result.facebook) {
        await setCachedData(cacheKey, 'social', result, 30);
      }

      return result;
    })(),

    // Company basic info
    (async () => {
      const cacheKey = getCompanyCacheKey(company);
      const cached = await getCachedData(cacheKey, 'company');

      if (cached) {
        return cached;
      }

      const result = await searchCompanyInfo(company);

      if (result.website || result.description) {
        await setCachedData(cacheKey, 'company', result);
      }

      return result;
    })(),
  ]);

  onProgress?.('deep', 'Deep research complete');

  return {
    perplexityData,
    news,
    socialProfiles,
    companyInfo,
  };
}

/**
 * Fetch user personalization from profiles table
 */
async function fetchUserPersonalization(userId: string): Promise<UserPersonalization | undefined> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('profiles')
      .select('nickname, occupation, about_me, company_name, industry, communication_tone')
      .eq('id', userId)
      .single();

    if (data && (data.nickname || data.occupation || data.about_me)) {
      return data as UserPersonalization;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user personalization:', error);
    return undefined;
  }
}

/**
 * Main PRIORITIZED parallel enrichment pipeline
 * Total time: 10-18 seconds
 * User sees reviews/photos after 3-5 seconds (instant value!)
 */
export async function enrichContactParallel(
  contactId: string,
  onProgress?: EnrichmentProgressCallback,
  userId?: string
): Promise<ParallelEnrichmentResult> {
  try {
    // Get contact
    const contact = await getContact(contactId);

    if (!contact) {
      throw new Error('Contact not found');
    }

    onProgress?.('start', 'Starting enrichment pipeline...');

    // Fetch user personalization for AI message generation (non-blocking)
    const personalizationPromise = userId ? fetchUserPersonalization(userId) : Promise.resolve(undefined);

    // Update status to processing
    await updateContact(contactId, {
      enrichment_status: 'processing',
      enrichment_error: null,
    });

    // Detect if service provider FIRST (determines if we get GMB data)
    const { isServiceProvider, category } = detectServiceProvider(
      contact.job_title,
      contact.company
    );

    // PHASE 1: GOOGLE MY BUSINESS (PRIORITY - 3-5 sec)
    // Get this FIRST so user sees reviews/photos immediately
    const gmbData = await phase1_gmb(
      contact.company,
      contact.met_at, // Use "met at" as location hint
      onProgress
    );

    // PHASE 2: LINKEDIN (2-3 sec)
    const linkedInResult = await phase2_linkedin(
      contact.first_name,
      contact.last_name,
      contact.company,
      onProgress
    );

    // PHASE 3: DEEP RESEARCH (5-10 sec, all parallel)
    const deepResult = await phase3_deep(
      contact.company,
      gmbData?.website || null,
      onProgress
    );

    // Generate reputation insight if we have GMB data
    let reputationInsight: any = null;
    if (gmbData?.success && gmbData.rating) {
      onProgress?.('summary', 'Generating reputation insight...');
      reputationInsight = await generateReputationInsight({
        businessName: contact.company || '',
        jobTitle: contact.job_title,
        serviceCategory: category || 'business',
        rating: gmbData.rating,
        reviewCount: gmbData.review_count || 0,
        hasWebsite: !!gmbData.website,
        isActive: gmbData.is_open || true,
      });
    }

    // Generate AI summary with user personalization
    onProgress?.('summary', 'Generating personalized AI summary...');

    // Wait for personalization to be fetched
    const userPersonalization = await personalizationPromise;
    if (userPersonalization) {
      onProgress?.('summary', `Writing messages as ${userPersonalization.nickname || 'you'}...`);
    }

    const summaryResult = await generateContactSummary({
      firstName: contact.first_name,
      lastName: contact.last_name,
      jobTitle: contact.job_title,
      company: contact.company,
      linkedInSnippet: linkedInResult?.snippet,
      companyDescription:
        deepResult.perplexityData?.company_description || deepResult.companyInfo?.description,
      companyIndustry: deepResult.companyInfo?.industry,
      companyNews: deepResult.news,
    }, userPersonalization);

    // Merge social media data (prefer Perplexity, fallback to Serper)
    const socialMedia = deepResult.perplexityData?.social_media || deepResult.socialProfiles;

    // ============================================================================
    // RANK DECISION MAKERS (if executives exist)
    // ============================================================================
    let rankedExecutives = deepResult.perplexityData?.executives || null;
    if (rankedExecutives && rankedExecutives.length > 0) {
      const { rankDecisionMakers } = await import('@/lib/services/decision-maker-finder');
      rankedExecutives = rankDecisionMakers(rankedExecutives);
      onProgress?.('decision_makers', `Identified ${rankedExecutives.length} key decision makers`);
    }

    // Update contact with ALL data
    await updateContact(contactId, {
      // GMB data (PRIORITY)
      reputation_score: gmbData?.rating || null,
      review_count: gmbData?.review_count || null,
      review_source: gmbData?.success ? 'serpapi_gmb' : null,
      reputation_summary: reputationInsight?.summary || null,
      reputation_checked_at: gmbData?.success ? new Date().toISOString() : null,
      gmb_reviews: gmbData?.reviews || null,
      gmb_photos: gmbData?.photos || null,
      gmb_place_id: gmbData?.place_id || null,
      gmb_hours: gmbData?.hours || null,

      // LinkedIn
      linkedin_url: linkedInResult.url,

      // Deep research
      company_website: gmbData?.website || deepResult.companyInfo?.website,
      company_industry: deepResult.companyInfo?.industry,
      recent_news: deepResult.news,

      // Perplexity data
      company_size: deepResult.perplexityData?.company_size,
      company_revenue: deepResult.perplexityData?.company_revenue,
      company_funding: deepResult.perplexityData?.company_funding,
      company_founded: deepResult.perplexityData?.company_founded,
      company_employees: deepResult.perplexityData?.company_employees,
      company_description: deepResult.perplexityData?.company_description,
      founders: deepResult.perplexityData?.founders,
      executives: rankedExecutives, // Use ranked executives instead of raw
      competitors: deepResult.perplexityData?.competitors,
      social_media: socialMedia,
      technologies: deepResult.perplexityData?.technologies,
      job_openings: deepResult.perplexityData?.job_openings,
      locations: deepResult.perplexityData?.locations,
      crunchbase_url: deepResult.perplexityData?.crunchbase_url,

      // Service provider
      is_service_provider: isServiceProvider,
      service_category: category,
      website_status: gmbData?.website ? 'active' : null,

      // AI insights
      ai_summary: summaryResult.summary,
      icebreakers: summaryResult.icebreakers,
      sms_templates: summaryResult.sms_templates || [],
      email_templates: summaryResult.email_templates || [],

      // Status
      enrichment_status: 'completed',
      enrichment_error: null,
    });

    onProgress?.('complete', 'Enrichment complete!');

    // ============================================================================
    // GOHIGHLEVEL SYNC (if enabled)
    // ============================================================================
    try {
      const { syncContactToGHL } = await import('@/lib/services/gohighlevel');
      const ghlResult = await syncContactToGHL(contactId);

      if (ghlResult.success && ghlResult.ghlContactId) {
        await updateContact(contactId, {
          ghl_contact_id: ghlResult.ghlContactId,
          ghl_synced_at: new Date().toISOString(),
          ghl_sync_error: null,
        });
        onProgress?.('ghl_sync', 'Synced to GoHighLevel');
      } else if (ghlResult.error) {
        await updateContact(contactId, {
          ghl_sync_error: JSON.stringify({
            message: ghlResult.error,
            errorCode: ghlResult.errorCode,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (error) {
      console.error('GHL sync error (non-fatal):', error);
      // Don't throw - enrichment succeeded, sync is bonus feature
    }

    return {
      success: true,
      // GMB (PRIORITY)
      gmbData,
      gmbReviews: gmbData?.reviews || [],
      gmbPhotos: gmbData?.photos || [],
      reputationScore: gmbData?.rating || null,
      reviewCount: gmbData?.review_count || null,
      // LinkedIn
      linkedInUrl: linkedInResult.url,
      // Deep research
      companyWebsite: gmbData?.website || deepResult.companyInfo?.website,
      companyIndustry: deepResult.companyInfo?.industry,
      recentNews: deepResult.news,
      perplexityData: deepResult.perplexityData,
      socialProfiles: deepResult.socialProfiles,
      // Service provider
      isServiceProvider,
      serviceCategory: category,
      reputationSummary: reputationInsight?.summary || null,
      // AI
      aiSummary: summaryResult.summary,
      icebreakers: summaryResult.icebreakers,
      smsTemplates: summaryResult.sms_templates || [],
      emailTemplates: summaryResult.email_templates || [],
      error: null,
    };
  } catch (error) {
    console.error('Parallel enrichment error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Enrichment failed';

    // Update contact with error status
    try {
      await updateContact(contactId, {
        enrichment_status: 'failed',
        enrichment_error: errorMessage,
      });
    } catch (updateError) {
      console.error('Failed to update contact with error status:', updateError);
    }

    onProgress?.('error', errorMessage);

    return {
      success: false,
      gmbData: null,
      gmbReviews: [],
      gmbPhotos: [],
      linkedInUrl: null,
      companyWebsite: null,
      companyIndustry: null,
      recentNews: [],
      isServiceProvider: false,
      serviceCategory: null,
      reputationScore: null,
      reviewCount: null,
      reputationSummary: null,
      perplexityData: null,
      socialProfiles: null,
      aiSummary: null,
      icebreakers: [],
      smsTemplates: [],
      emailTemplates: [],
      error: errorMessage,
    };
  }
}
