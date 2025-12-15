// Enrichment pipeline - orchestrates contact research and AI summary generation
import { getContact, updateContact } from '@/lib/database/contacts';
import { searchLinkedInProfile, searchCompanyInfo, searchCompanyNews } from '@/lib/services/serper';
import { generateContactSummary, generateReputationInsight } from '@/lib/services/openai';
import { searchGooglePlaces } from '@/lib/services/googlePlaces';
import { detectServiceProvider } from '@/lib/services/serviceProviderDetection';
import { enrichContactWithApollo, shouldUseApollo } from '@/lib/services/apollo';
import {
  getCachedData,
  setCachedData,
  getLinkedInCacheKey,
  getCompanyCacheKey,
  getNewsCacheKey,
} from './cache';

export type EnrichmentResult = {
  success: boolean;
  linkedInUrl: string | null;
  companyWebsite: string | null;
  companyIndustry: string | null;
  recentNews: string[];
  aiSummary: string | null;
  icebreakers: string[];
  usedApollo?: boolean;
  error: string | null;
};

/**
 * Main enrichment pipeline for a contact
 * Steps:
 * 1. Fetch contact from database
 * 2. Search LinkedIn profile (with caching)
 * 3. Search company info (with caching)
 * 4. Search company news (with caching)
 * 4.5. Service provider reputation check (NEW - Google Places + AI evaluation)
 * 5. Generate AI summary and icebreakers
 * 6. Update contact in database
 */
export async function enrichContact(contactId: string): Promise<EnrichmentResult> {
  try {
    // Step 1: Get contact
    const contact = await getContact(contactId);

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Update status to processing
    await updateContact(contactId, {
      enrichment_status: 'processing',
      enrichment_error: null,
    });

    const result: EnrichmentResult = {
      success: false,
      linkedInUrl: null,
      companyWebsite: null,
      companyIndustry: null,
      recentNews: [],
      aiSummary: null,
      icebreakers: [],
      error: null,
    };

    // Step 2: Search LinkedIn profile
    let linkedInResult: any = null;
    if (contact.first_name && contact.last_name) {
      const linkedInCacheKey = getLinkedInCacheKey(
        contact.first_name,
        contact.last_name,
        contact.company || undefined
      );

      // Check cache first
      const cachedLinkedIn = await getCachedData(linkedInCacheKey, 'linkedin');
      if (cachedLinkedIn) {
        linkedInResult = cachedLinkedIn;
      } else {
        // Search LinkedIn
        linkedInResult = await searchLinkedInProfile(
          contact.first_name,
          contact.last_name,
          contact.company || undefined
        );

        // Cache result
        if (linkedInResult.url) {
          await setCachedData(linkedInCacheKey, 'linkedin', linkedInResult);
        }
      }

      result.linkedInUrl = linkedInResult.url;
    }

    // Step 2.5: Apollo.io enrichment (selective - only when missing email/phone)
    let usedApollo = false;
    if (contact.first_name && contact.last_name && shouldUseApollo(contact.email, contact.phone)) {
      const apolloResult = await enrichContactWithApollo({
        firstName: contact.first_name,
        lastName: contact.last_name,
        company: contact.company || undefined,
        linkedInUrl: result.linkedInUrl || undefined,
        domain: result.companyWebsite || undefined,
      });

      if (apolloResult) {
        usedApollo = true;

        // Update contact immediately with Apollo data
        const apolloUpdate: any = {};
        if (apolloResult.email && !contact.email) {
          apolloUpdate.email = apolloResult.email;
          contact.email = apolloResult.email; // Update local copy
        }
        if (apolloResult.phone && !contact.phone) {
          apolloUpdate.phone = apolloResult.phone;
          contact.phone = apolloResult.phone; // Update local copy
        }
        if (apolloResult.linkedin_url && !result.linkedInUrl) {
          apolloUpdate.linkedin_url = apolloResult.linkedin_url;
          result.linkedInUrl = apolloResult.linkedin_url;
        }

        // Save Apollo enrichment immediately
        if (Object.keys(apolloUpdate).length > 0) {
          await updateContact(contactId, apolloUpdate);
        }
      }
    }

    result.usedApollo = usedApollo;

    // Step 3: Search company info
    let companyResult: any = null;
    if (contact.company) {
      const companyCacheKey = getCompanyCacheKey(contact.company);

      // Check cache first
      const cachedCompany = await getCachedData(companyCacheKey, 'company');
      if (cachedCompany) {
        companyResult = cachedCompany;
      } else {
        // Search company
        companyResult = await searchCompanyInfo(contact.company);

        // Cache result
        if (companyResult.website || companyResult.description) {
          await setCachedData(companyCacheKey, 'company', companyResult);
        }
      }

      result.companyWebsite = companyResult.website;
      result.companyIndustry = companyResult.industry;
    }

    // Step 4: Search company news
    let newsResult: string[] = [];
    if (contact.company) {
      const newsCacheKey = getNewsCacheKey(contact.company);

      // Check cache first (news expires faster - 7 days)
      const cachedNews = await getCachedData(newsCacheKey, 'news');
      if (cachedNews) {
        newsResult = cachedNews;
      } else {
        // Search news
        newsResult = await searchCompanyNews(contact.company);

        // Cache result (7-day TTL for news)
        if (newsResult.length > 0) {
          await setCachedData(newsCacheKey, 'news', newsResult, 7);
        }
      }

      result.recentNews = newsResult;
    }

    // Step 4.5: Service Provider Reputation Check (NEW)
    const { isServiceProvider, category } = detectServiceProvider(
      contact.job_title,
      contact.company
    );

    let reputationData: any = null;
    let reputationInsight: any = null;

    if (isServiceProvider && contact.company) {
      const reputationCacheKey = `reputation:${contact.company}`.toLowerCase().replace(/\s+/g, '_');

      // Check cache first (7-day TTL for reputation data)
      reputationData = await getCachedData(reputationCacheKey, 'reputation');

      if (!reputationData) {
        // Search Google Places for reputation
        reputationData = await searchGooglePlaces(
          contact.company,
          contact.met_at || undefined
        );

        // Cache for 7 days (shorter than other enrichment data)
        if (reputationData.success) {
          await setCachedData(reputationCacheKey, 'reputation', reputationData, 7);
        }
      }

      // Generate AI reputation insight
      if (reputationData) {
        reputationInsight = await generateReputationInsight({
          businessName: contact.company,
          jobTitle: contact.job_title,
          serviceCategory: category || 'service provider',
          rating: reputationData.rating,
          reviewCount: reputationData.reviewCount,
          hasWebsite: !!reputationData.website,
          isActive: reputationData.isActive,
        });
      }
    }

    // Step 5: Generate AI summary and icebreakers
    const summaryResult = await generateContactSummary({
      firstName: contact.first_name,
      lastName: contact.last_name,
      jobTitle: contact.job_title,
      company: contact.company,
      linkedInSnippet: linkedInResult?.snippet,
      companyDescription: companyResult?.description,
      companyIndustry: companyResult?.industry,
      companyNews: newsResult,
    });

    result.aiSummary = summaryResult.summary;
    result.icebreakers = summaryResult.icebreakers;

    // Step 6: Update contact in database
    await updateContact(contactId, {
      linkedin_url: result.linkedInUrl,
      company_website: result.companyWebsite,
      company_industry: result.companyIndustry,
      recent_news: result.recentNews,
      ai_summary: result.aiSummary,
      icebreakers: result.icebreakers,
      // Reputation fields (NEW)
      is_service_provider: isServiceProvider,
      service_category: category,
      reputation_score: reputationData?.rating || null,
      review_count: reputationData?.reviewCount || null,
      review_source: reputationData?.success ? 'google' : null,
      reputation_summary: reputationInsight?.summary || null,
      website_status: reputationData?.website ? 'active' : reputationData?.success ? 'none' : null,
      reputation_checked_at: isServiceProvider ? new Date().toISOString() : null,
      reputation_error: reputationData?.error || null,
      // GMB photos and reviews
      gmb_photos: reputationData?.photos || null,
      gmb_reviews: reputationData?.reviews || null,
      enrichment_status: 'completed',
      enrichment_error: null,
    });

    result.success = true;
    return result;
  } catch (error) {
    console.error('Enrichment pipeline error:', error);

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

    return {
      success: false,
      linkedInUrl: null,
      companyWebsite: null,
      companyIndustry: null,
      recentNews: [],
      aiSummary: null,
      icebreakers: [],
      error: errorMessage,
    };
  }
}

/**
 * Batch enrichment for multiple contacts
 * Processes contacts sequentially to avoid rate limits
 */
export async function batchEnrichContacts(contactIds: string[]): Promise<{
  successful: number;
  failed: number;
  results: Map<string, EnrichmentResult>;
}> {
  const results = new Map<string, EnrichmentResult>();
  let successful = 0;
  let failed = 0;

  for (const contactId of contactIds) {
    try {
      const result = await enrichContact(contactId);
      results.set(contactId, result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add delay to respect rate limits (2 seconds between requests)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Batch enrichment error for contact ${contactId}:`, error);
      failed++;
      results.set(contactId, {
        success: false,
        linkedInUrl: null,
        companyWebsite: null,
        companyIndustry: null,
        recentNews: [],
        aiSummary: null,
        icebreakers: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed, results };
}

/**
 * Re-enrich a contact (clears cache first)
 */
export async function reEnrichContact(contactId: string): Promise<EnrichmentResult> {
  try {
    const contact = await getContact(contactId);

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Note: We're not clearing cache to save API costs
    // If needed, implement cache invalidation here

    return await enrichContact(contactId);
  } catch (error) {
    console.error('Re-enrichment error:', error);
    throw error;
  }
}
