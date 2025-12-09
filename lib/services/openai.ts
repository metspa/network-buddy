// OpenAI service for generating AI summaries and conversation starters
import OpenAI from 'openai';

export type SmsTemplate = {
  message: string; // Short message under 160 chars
};

export type EmailTemplate = {
  subject: string;
  body: string;
};

export type ContactSummaryResult = {
  summary: string;
  icebreakers: string[];
  sms_templates?: SmsTemplate[];
  email_templates?: EmailTemplate[];
};

export type UserPersonalization = {
  nickname?: string | null;
  occupation?: string | null;
  about_me?: string | null;
  company_name?: string | null;
  industry?: string | null;
  communication_tone?: string | null;
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
}, userPersonalization?: UserPersonalization): Promise<ContactSummaryResult> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || 'Unknown';
    const contactFirstName = contactData.firstName || 'there';

    // Build context from available data
    const context = buildContext(contactData);

    // Build personalization context
    const personalizationContext = buildPersonalizationContext(userPersonalization);
    const tone = userPersonalization?.communication_tone || 'professional';
    const senderName = userPersonalization?.nickname || 'the sender';

    const prompt = `You are writing personalized follow-up messages for ${senderName} who just met ${fullName} at a networking event.

=== ABOUT THE SENDER (WHO IS WRITING THE MESSAGE) ===
${personalizationContext || 'No personalization set - use generic professional tone.'}

=== ABOUT THE CONTACT (WHO THEY MET) ===
${context}

=== YOUR TASK ===
1. Generate a concise 150-word summary about ${fullName} and their company
2. Create 3 short TEXT MESSAGE templates (under 160 characters each)
3. Create 3 EMAIL templates with subject lines and bodies

=== TONE: ${tone.toUpperCase()} ===
${tone === 'casual' ? '- Relaxed, conversational, like texting a friend\n- Use contractions, informal language\n- Emojis are OK sparingly' : ''}
${tone === 'friendly' ? '- Warm and approachable but still professional\n- Personable but not too casual\n- Show genuine interest' : ''}
${tone === 'professional' ? '- Polished and business-appropriate\n- Formal but not stiff\n- Focus on value and mutual benefit' : ''}

=== GUIDELINES FOR TEXT MESSAGES ===
- MUST be under 160 characters
- Sound like ${senderName} is writing them personally
- Reference their shared context (industry, event, mutual interests)
- Include a soft call-to-action
- Make it feel authentic, not templated

=== GUIDELINES FOR EMAILS ===
- Sound like ${senderName} wrote them personally
- Reference who ${senderName} is and what they do
- Create genuine connection points based on both people's backgrounds
- Subject lines should be personal, not generic "Great meeting you"
- Body: 2-3 short paragraphs with clear value proposition
- Sign off appropriately for the tone

Return JSON in this exact format:
{
  "summary": "150-word summary about ${fullName} here",
  "icebreakers": [
    "Conversation starter that connects both people's interests...",
    "Another relevant talking point...",
    "Third conversation opener..."
  ],
  "sms_templates": [
    { "message": "Hey ${contactFirstName}! [Personalized message under 160 chars]" },
    { "message": "Second text template..." },
    { "message": "Third text template..." }
  ],
  "email_templates": [
    {
      "subject": "[Personalized subject line]",
      "body": "Hi ${contactFirstName},\\n\\n[Personalized body that sounds like ${senderName} wrote it]\\n\\n[Signature]"
    },
    {
      "subject": "Subject 2...",
      "body": "Body 2..."
    },
    {
      "subject": "Subject 3...",
      "body": "Body 3..."
    }
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
      sms_templates: Array.isArray(parsed.sms_templates) ? parsed.sms_templates : [],
      email_templates: Array.isArray(parsed.email_templates) ? parsed.email_templates : [],
    };
  } catch (error) {
    console.error('OpenAI summary generation error:', error);

    // Return fallback summary
    const firstName = contactData.firstName || '';
    const company = contactData.company || 'your company';

    return {
      summary: `${firstName} ${contactData.lastName || ''} works as ${contactData.jobTitle || 'a professional'} at ${company}. Connect with them to learn more about their work and expertise.`,
      icebreakers: [
        `What brought you to this event today?`,
        `How long have you been with ${company}?`,
        `What are some of the biggest challenges in ${contactData.companyIndustry || 'your industry'} right now?`,
      ],
      sms_templates: [
        { message: `Hey${firstName ? ` ${firstName}` : ''}! Great meeting you. Would love to grab coffee and continue our chat. Free this week?` },
        { message: `Hi${firstName ? ` ${firstName}` : ''}! Following up from our conversation. Let me know if you'd like to connect again soon!` },
        { message: `Nice meeting you${firstName ? `, ${firstName}` : ''}! Let's stay in touch. Coffee or a quick call sometime?` },
      ],
      email_templates: [
        {
          subject: `Great meeting you${firstName ? `, ${firstName}` : ''}!`,
          body: `Hi${firstName ? ` ${firstName}` : ''},\n\nIt was a pleasure meeting you recently. I really enjoyed our conversation.\n\nI'd love to continue our discussion over coffee or a quick call. Would you be available sometime this week?\n\nLooking forward to staying in touch!\n\nBest regards`,
        },
        {
          subject: `Following up from our conversation`,
          body: `Hi${firstName ? ` ${firstName}` : ''},\n\nI wanted to reach out and say it was great connecting with you. Your insights about ${company} were really interesting.\n\nWould love to explore ways we might be able to help each other. Let me know if you have time for a quick chat.\n\nBest regards`,
        },
        {
          subject: `Let's connect!`,
          body: `Hi${firstName ? ` ${firstName}` : ''},\n\nHope this finds you well! I've been thinking about our conversation and would love to continue it.\n\nAre you free for coffee or a call in the coming weeks?\n\nBest regards`,
        },
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
 * Build personalization context from user profile
 */
function buildPersonalizationContext(personalization?: UserPersonalization): string {
  if (!personalization) return '';

  const parts: string[] = [];

  if (personalization.nickname) {
    parts.push(`Name: ${personalization.nickname}`);
  }

  if (personalization.occupation) {
    parts.push(`Role: ${personalization.occupation}`);
  }

  if (personalization.company_name) {
    parts.push(`Company: ${personalization.company_name}`);
  }

  if (personalization.industry) {
    parts.push(`Industry: ${personalization.industry}`);
  }

  if (personalization.about_me) {
    parts.push(`\nAbout them:\n${personalization.about_me}`);
  }

  if (personalization.communication_tone) {
    parts.push(`\nPreferred tone: ${personalization.communication_tone}`);
  }

  return parts.join('\n');
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
