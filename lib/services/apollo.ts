/**
 * Apollo.io API Client
 *
 * Provides email and phone enrichment for contacts using Apollo.io's People Match API
 * Cost: ~$0.10-0.50 per successful enrichment
 *
 * Strategy: Selective - only call when contact is missing email OR phone
 */

export type ApolloEnrichmentResult = {
  email: string | null;
  phone: string | null;
  verified_email: boolean;
  confidence_score: number;
  linkedin_url: string | null;
  organization: {
    name: string;
    website: string;
  } | null;
};

export type ApolloEnrichmentInput = {
  firstName: string;
  lastName: string;
  company?: string;
  linkedInUrl?: string;
  domain?: string;
};

/**
 * Enrich a contact with email and phone using Apollo.io
 *
 * @param input - Contact information to enrich
 * @returns Enriched contact data or null if not found
 */
export async function enrichContactWithApollo(
  input: ApolloEnrichmentInput
): Promise<ApolloEnrichmentResult | null> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.warn('Apollo.io API key not configured, skipping Apollo enrichment');
    return null;
  }

  try {
    // Call Apollo.io People Match API
    // Docs: https://apolloio.github.io/apollo-api-docs/#people-match
    const response = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        organization_name: input.company,
        linkedin_url: input.linkedInUrl,
        domain: input.domain,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo.io API error (${response.status}):`, errorText);

      // Return null on errors instead of throwing
      // This allows enrichment to continue with available data
      return null;
    }

    const data = await response.json();

    // Check if person was found
    if (!data.person) {
      console.log('Apollo.io: No person found for', input.firstName, input.lastName);
      return null;
    }

    const person = data.person;

    // Extract enriched data
    return {
      email: person.email || null,
      phone: person.phone_numbers?.[0]?.raw_number || null,
      verified_email: person.email_status === 'verified',
      confidence_score: person.contact_accuracy_score || 0,
      linkedin_url: person.linkedin_url || null,
      organization: person.organization ? {
        name: person.organization.name,
        website: person.organization.website_url,
      } : null,
    };
  } catch (error) {
    console.error('Apollo.io enrichment error:', error);
    return null;
  }
}

/**
 * Determine if a contact needs Apollo enrichment
 *
 * Strategy: Only enrich if missing email OR phone
 *
 * @param email - Current contact email
 * @param phone - Current contact phone
 * @returns true if Apollo enrichment should be attempted
 */
export function shouldUseApollo(email?: string | null, phone?: string | null): boolean {
  return !email || !phone;
}

/**
 * Calculate estimated cost for Apollo enrichment
 *
 * @param usedApollo - Whether Apollo was actually called
 * @returns Estimated cost in USD
 */
export function getApolloCost(usedApollo: boolean): number {
  // Average cost per Apollo enrichment
  // Actual cost varies based on data quality and credits purchased
  return usedApollo ? 0.25 : 0;
}

/**
 * Search for people at a company using Apollo.io Organization Search
 * Use this when you only have a company name and need to find decision makers
 *
 * @param companyName - Company name to search
 * @param domain - Optional company domain for better matching
 * @param limit - Max results (default 5)
 * @returns Array of people at the company
 */
export async function searchPeopleAtCompany(
  companyName: string,
  domain?: string,
  limit: number = 5
): Promise<ApolloPersonResult[]> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.warn('Apollo.io API key not configured, skipping company search');
    return [];
  }

  try {
    // Apollo.io People Search API
    // Docs: https://apolloio.github.io/apollo-api-docs/#people-search
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        organization_domains: domain ? [domain] : undefined,
        page: 1,
        per_page: limit,
        // Prioritize senior titles
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo.io People Search error (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json();

    if (!data.people || data.people.length === 0) {
      console.log('Apollo.io: No people found at company', companyName);
      return [];
    }

    // Map results to our format
    return data.people.map((person: any) => ({
      firstName: person.first_name || null,
      lastName: person.last_name || null,
      title: person.title || null,
      email: person.email || null,
      phone: person.phone_numbers?.[0]?.raw_number || null,
      linkedinUrl: person.linkedin_url || null,
      company: person.organization?.name || companyName,
      seniority: person.seniority || null,
    }));
  } catch (error) {
    console.error('Apollo.io company search error:', error);
    return [];
  }
}

export type ApolloPersonResult = {
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  company: string | null;
  seniority: string | null;
};

/**
 * Enrich an executive (from Perplexity) with email/phone using Apollo
 * This bridges Perplexity's executive discovery with Apollo's contact data
 *
 * @param executive - Executive data from Perplexity
 * @param company - Company name
 * @returns Enriched executive with email/phone
 */
export async function enrichExecutiveWithApollo(
  executive: { name: string; title: string; linkedin_url?: string | null },
  company: string
): Promise<ApolloEnrichmentResult | null> {
  // Parse name into first/last
  const nameParts = executive.name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  if (!firstName) {
    console.log('Apollo.io: Cannot enrich executive without first name');
    return null;
  }

  return enrichContactWithApollo({
    firstName,
    lastName,
    company,
    linkedInUrl: executive.linkedin_url || undefined,
  });
}

/**
 * Reverse lookup: find person info from email address
 *
 * @param email - Email address to look up
 * @returns Person info if found
 */
export async function lookupPersonByEmail(
  email: string
): Promise<ApolloPersonResult | null> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.warn('Apollo.io API key not configured, skipping email lookup');
    return null;
  }

  try {
    const response = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        email: email,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo.io email lookup error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();

    if (!data.person) {
      console.log('Apollo.io: No person found for email', email);
      return null;
    }

    const person = data.person;
    return {
      firstName: person.first_name || null,
      lastName: person.last_name || null,
      title: person.title || null,
      email: person.email || email,
      phone: person.phone_numbers?.[0]?.raw_number || null,
      linkedinUrl: person.linkedin_url || null,
      company: person.organization?.name || null,
      seniority: person.seniority || null,
    };
  } catch (error) {
    console.error('Apollo.io email lookup error:', error);
    return null;
  }
}
