// Serper API service for Google search, LinkedIn, and company research
// https://serper.dev/

export type LinkedInSearchResult = {
  url: string | null;
  snippet: string | null;
  title: string | null;
};

export type CompanySearchResult = {
  website: string | null;
  industry: string | null;
  description: string | null;
  news: string[];
};

/**
 * Search for a person's LinkedIn profile using Google search via Serper API
 */
export async function searchLinkedInProfile(
  firstName: string,
  lastName: string,
  company?: string
): Promise<LinkedInSearchResult> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set');
    }

    // Build search query
    const nameQuery = `"${firstName} ${lastName}"`;
    const companyQuery = company ? ` ${company}` : '';
    const query = `${nameQuery}${companyQuery} site:linkedin.com/in`;

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5, // Get top 5 results
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract first LinkedIn profile result
    const firstResult = data.organic?.[0];

    if (!firstResult) {
      return {
        url: null,
        snippet: null,
        title: null,
      };
    }

    return {
      url: firstResult.link || null,
      snippet: firstResult.snippet || null,
      title: firstResult.title || null,
    };
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return {
      url: null,
      snippet: null,
      title: null,
    };
  }
}

/**
 * Search for company information using Google search via Serper API
 */
export async function searchCompanyInfo(companyName: string): Promise<CompanySearchResult> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set');
    }

    // Search for company website and info
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${companyName} company`,
        num: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract website from knowledge graph or first result
    const website = data.knowledgeGraph?.website || data.organic?.[0]?.link || null;

    // Extract industry/description from knowledge graph
    const industry = data.knowledgeGraph?.type || null;
    const description = data.knowledgeGraph?.description || data.organic?.[0]?.snippet || null;

    return {
      website,
      industry,
      description,
      news: [],
    };
  } catch (error) {
    console.error('Company search error:', error);
    return {
      website: null,
      industry: null,
      description: null,
      news: [],
    };
  }
}

/**
 * Search for recent company news using Google News search via Serper API
 */
export async function searchCompanyNews(companyName: string): Promise<string[]> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set');
    }

    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: companyName,
        num: 5, // Get top 5 news items
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract news headlines
    const news = data.news?.slice(0, 5).map((item: any) => item.title) || [];

    return news;
  } catch (error) {
    console.error('Company news search error:', error);
    return [];
  }
}

/**
 * Validate Serper API key
 */
export async function validateSerperAPIKey(): Promise<boolean> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return false;
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'test',
        num: 1,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Serper API validation error:', error);
    return false;
  }
}
