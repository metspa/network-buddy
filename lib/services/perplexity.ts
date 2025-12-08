// Perplexity AI deep company research service
// Replaces 5+ separate searches with 1 comprehensive API call
// Cost: ~$0.015 per query
// Speed: 3-4 seconds

export type PerplexityCompanyData = {
  company_size: string | null; // e.g., "50-200 employees", "Enterprise (1000+)"
  company_revenue: string | null; // e.g., "$10M-$50M", "$500M+"
  company_funding: string | null; // e.g., "Series B, $25M", "Bootstrapped"
  company_founded: number | null; // Year founded
  company_employees: string | null; // Employee count range
  company_description: string | null; // Brief company description
  founders: string[] | null; // List of founder names
  executives: Executive[] | null; // Key executives with LinkedIn URLs
  competitors: string[] | null; // Top 3 competitors
  technologies: string[] | null; // Technologies/stack used
  job_openings: number | null; // Number of open positions
  locations: string[] | null; // Office locations
  social_media: SocialMedia | null; // Social media profiles
  crunchbase_url: string | null; // Crunchbase profile URL
};

export type Executive = {
  name: string;
  title: string;
  linkedin_url: string | null;
};

export type SocialMedia = {
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  linkedin_company: string | null;
};

/**
 * Deep company research using Perplexity AI
 * This replaces multiple separate API calls with one comprehensive search
 */
export async function researchCompanyWithPerplexity(
  companyName: string,
  website?: string | null
): Promise<PerplexityCompanyData> {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    // Build search query
    const searchQuery = website
      ? `${companyName} ${website}`
      : companyName;

    const prompt = `Research the company "${searchQuery}" and provide comprehensive information.

Extract and return the following data in JSON format:

{
  "company_size": "employee count range (e.g., '50-200', '1000+', 'Small Business', 'Enterprise')",
  "company_revenue": "revenue range or estimate (e.g., '$10M-$50M', '$500M+')",
  "company_funding": "funding status (e.g., 'Series B, $25M', 'Bootstrapped', 'Public')",
  "company_founded": year_founded_as_integer,
  "company_employees": "current employee count or range",
  "company_description": "1-2 sentence company description",
  "founders": ["founder1", "founder2"],
  "executives": [
    {
      "name": "Executive Name",
      "title": "CEO",
      "linkedin_url": "https://linkedin.com/in/..."
    }
  ],
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "technologies": ["tech1", "tech2", "tech3"],
  "job_openings": number_of_open_positions,
  "locations": ["City, State/Country", "City2, Country2"],
  "social_media": {
    "twitter": "https://twitter.com/handle or null",
    "instagram": "https://instagram.com/handle or null",
    "facebook": "https://facebook.com/page or null",
    "tiktok": "https://tiktok.com/@handle or null",
    "linkedin_company": "https://linkedin.com/company/name or null"
  },
  "crunchbase_url": "https://crunchbase.com/organization/... or null"
}

RULES:
1. Return null for any field you cannot find reliable information for
2. For executives, try to find at least the CEO/founder with LinkedIn URL
3. Focus on recent, accurate information (2023-2025)
4. Only return the JSON object, no explanation
5. If the company is very small or local, do your best with available data`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business research expert. Return only valid JSON with comprehensive company data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Perplexity API');
    }

    // Parse JSON response
    // Perplexity sometimes wraps JSON in markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    const parsed = JSON.parse(jsonText);

    // Validate and normalize data
    return {
      company_size: parsed.company_size || null,
      company_revenue: parsed.company_revenue || null,
      company_funding: parsed.company_funding || null,
      company_founded: parsed.company_founded ? parseInt(String(parsed.company_founded)) : null,
      company_employees: parsed.company_employees || null,
      company_description: parsed.company_description || null,
      founders: Array.isArray(parsed.founders) ? parsed.founders : null,
      executives: Array.isArray(parsed.executives)
        ? parsed.executives.map((exec: any) => ({
            name: exec.name || '',
            title: exec.title || '',
            linkedin_url: exec.linkedin_url || null,
          }))
        : null,
      competitors: Array.isArray(parsed.competitors) ? parsed.competitors.slice(0, 3) : null,
      technologies: Array.isArray(parsed.technologies) ? parsed.technologies : null,
      job_openings: parsed.job_openings ? parseInt(String(parsed.job_openings)) : null,
      locations: Array.isArray(parsed.locations) ? parsed.locations : null,
      social_media: parsed.social_media
        ? {
            twitter: parsed.social_media.twitter || null,
            instagram: parsed.social_media.instagram || null,
            facebook: parsed.social_media.facebook || null,
            tiktok: parsed.social_media.tiktok || null,
            linkedin_company: parsed.social_media.linkedin_company || null,
          }
        : null,
      crunchbase_url: parsed.crunchbase_url || null,
    };
  } catch (error) {
    console.error('Perplexity research error:', error);

    // Return empty result on error (graceful degradation)
    // Don't throw - we want enrichment to continue even if Perplexity fails
    return {
      company_size: null,
      company_revenue: null,
      company_funding: null,
      company_founded: null,
      company_employees: null,
      company_description: null,
      founders: null,
      executives: null,
      competitors: null,
      technologies: null,
      job_openings: null,
      locations: null,
      social_media: null,
      crunchbase_url: null,
    };
  }
}

/**
 * Check if Perplexity returned useful data
 */
export function hasPerplexityData(data: PerplexityCompanyData): boolean {
  return !!(
    data.company_size ||
    data.company_revenue ||
    data.company_founded ||
    data.company_description ||
    (data.founders && data.founders.length > 0) ||
    (data.executives && data.executives.length > 0) ||
    (data.competitors && data.competitors.length > 0)
  );
}
