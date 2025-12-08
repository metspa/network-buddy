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
