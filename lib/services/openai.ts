// OpenAI service for generating AI summaries and conversation starters
import OpenAI from 'openai';

export type ContactSummaryResult = {
  summary: string;
  icebreakers: string[];
};

/**
 * Generate AI summary and conversation starters for a contact
 */
export async function generateContactSummary(contactData: {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  linkedInSnippet?: string | null;
  companyDescription?: string | null;
  companyIndustry?: string | null;
  companyNews?: string[];
}): Promise<ContactSummaryResult> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || 'Unknown';

    // Build context from available data
    const context = buildContext(contactData);

    const prompt = `You are helping a networker prepare for a conversation at a networking event.

${context}

Your task:
1. Generate a concise 150-word summary about this person and their company
2. Create 5 specific, thoughtful conversation starters or questions

Guidelines for summary:
- Focus on their role, company, and industry
- Highlight interesting or notable aspects
- Keep it professional and factual
- Be concise but informative

Guidelines for icebreakers:
- Make them specific to this person/company (not generic)
- Mix professional and conversational tones
- Include questions about their work, industry trends, or recent news
- Make them natural conversation starters, not interrogations
- Avoid yes/no questions

Return your response as JSON in this exact format:
{
  "summary": "150-word summary here",
  "icebreakers": [
    "First conversation starter...",
    "Second conversation starter...",
    "Third conversation starter...",
    "Fourth conversation starter...",
    "Fifth conversation starter..."
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7, // Moderate creativity
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'No summary generated.',
      icebreakers: Array.isArray(parsed.icebreakers) ? parsed.icebreakers : [],
    };
  } catch (error) {
    console.error('OpenAI summary generation error:', error);

    // Return fallback summary
    return {
      summary: `${contactData.firstName || ''} ${contactData.lastName || ''} works as ${contactData.jobTitle || 'a professional'} at ${contactData.company || 'their company'}. Connect with them to learn more about their work and expertise.`,
      icebreakers: [
        `What brought you to this event today?`,
        `How long have you been with ${contactData.company || 'your company'}?`,
        `What are some of the biggest challenges in ${contactData.companyIndustry || 'your industry'} right now?`,
        `I'd love to hear more about your role as ${contactData.jobTitle || 'a professional'}.`,
        `What's the most exciting project you're working on at the moment?`,
      ],
    };
  }
}

/**
 * Generate reputation insight for a service provider
 */
export async function generateReputationInsight(data: {
  businessName: string;
  jobTitle: string | null;
  serviceCategory: string;
  rating: number | null;
  reviewCount: number | null;
  hasWebsite: boolean;
  isActive: boolean;
}): Promise<{
  summary: string;
  recommendation: 'hire' | 'caution' | 'avoid' | 'unknown';
  reasoning: string;
}> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Analyze this service provider's reputation and provide a hiring recommendation:

Business: ${data.businessName}
Service: ${data.serviceCategory}${data.jobTitle ? ` (${data.jobTitle})` : ''}
Google Rating: ${data.rating ? `${data.rating}/5.0 (${data.reviewCount} reviews)` : 'Not found'}
Website: ${data.hasWebsite ? 'Yes' : 'No'}
Business Status: ${data.isActive ? 'Active' : 'Inactive'}

Provide a hiring recommendation based on their online reputation.

Return JSON in this exact format:
{
  "summary": "2-sentence summary of their reputation",
  "recommendation": "hire|caution|avoid|unknown",
  "reasoning": "Brief reasoning for recommendation"
}

Guidelines for recommendation:
- "hire": 4.0+ stars with 20+ reviews OR 4.5+ stars with 10+ reviews
- "caution": 3.0-3.9 stars OR <20 reviews (needs more validation)
- "avoid": <3.0 stars OR business closed
- "unknown": No online presence found`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Low temperature for consistent recommendations
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'Unable to generate reputation summary.',
      recommendation: parsed.recommendation || 'unknown',
      reasoning: parsed.reasoning || 'Insufficient data available.',
    };
  } catch (error) {
    console.error('OpenAI reputation insight error:', error);

    // Return fallback based on rating only
    if (data.rating === null) {
      return {
        summary: `No online reviews found for ${data.businessName}. This business may be new or not listed on Google My Business.`,
        recommendation: 'unknown',
        reasoning: 'No online presence found',
      };
    }

    if (data.rating >= 4.0) {
      return {
        summary: `${data.businessName} has a ${data.rating}/5 rating based on ${data.reviewCount} reviews. Generally positive feedback from customers.`,
        recommendation: 'hire',
        reasoning: 'Good rating and customer feedback',
      };
    }

    if (data.rating >= 3.0) {
      return {
        summary: `${data.businessName} has a ${data.rating}/5 rating based on ${data.reviewCount} reviews. Mixed customer feedback.`,
        recommendation: 'caution',
        reasoning: 'Average rating suggests mixed experiences',
      };
    }

    return {
      summary: `${data.businessName} has a ${data.rating}/5 rating based on ${data.reviewCount} reviews. Concerning customer feedback.`,
      recommendation: 'avoid',
      reasoning: 'Low rating indicates customer dissatisfaction',
    };
  }
}

/**
 * Build context string from contact data
 */
function buildContext(contactData: {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  linkedInSnippet?: string | null;
  companyDescription?: string | null;
  companyIndustry?: string | null;
  companyNews?: string[];
}): string {
  const parts: string[] = [];

  // Basic info
  const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ');
  if (fullName) {
    parts.push(`Contact Name: ${fullName}`);
  }

  if (contactData.jobTitle) {
    parts.push(`Job Title: ${contactData.jobTitle}`);
  }

  if (contactData.company) {
    parts.push(`Company: ${contactData.company}`);
  }

  // LinkedIn info
  if (contactData.linkedInSnippet) {
    parts.push(`\nLinkedIn Profile:\n${contactData.linkedInSnippet}`);
  }

  // Company info
  if (contactData.companyDescription) {
    parts.push(`\nCompany Description:\n${contactData.companyDescription}`);
  }

  if (contactData.companyIndustry) {
    parts.push(`Industry: ${contactData.companyIndustry}`);
  }

  // Recent news
  if (contactData.companyNews && contactData.companyNews.length > 0) {
    parts.push(`\nRecent Company News:`);
    contactData.companyNews.forEach((news, i) => {
      parts.push(`${i + 1}. ${news}`);
    });
  }

  return parts.join('\n');
}

/**
 * Validate OpenAI API key
 */
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Simple test request
    await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
    });

    return true;
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return false;
  }
}
