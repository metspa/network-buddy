/**
 * Smart Auto-Fill Service
 *
 * Automatically fills in missing contact information by orchestrating multiple APIs:
 * - Perplexity: Find executives/decision makers from company name
 * - Apollo: Enrich contacts with email/phone
 * - Decision Maker Finder: Rank executives by authority
 *
 * Scenarios handled:
 * 1. Company only → Find top decision maker, get their email/phone
 * 2. Email only → Reverse lookup to get name/company
 * 3. Name + Company → Get email/phone
 * 4. All filled → No action needed
 */

import { researchCompanyWithPerplexity, type Executive } from '@/lib/services/perplexity';
import {
  enrichContactWithApollo,
  searchPeopleAtCompany,
  lookupPersonByEmail,
  enrichExecutiveWithApollo,
  type ApolloPersonResult,
} from '@/lib/services/apollo';
import { rankDecisionMakers, type RankedExecutive } from '@/lib/services/decision-maker-finder';

export type OCRData = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
};

export type AutoFillResult = {
  filled: OCRData;
  source: 'original' | 'apollo' | 'perplexity' | 'combined';
  autoFilledFields: string[];
  decisionMakers?: RankedExecutive[];
  selectedDecisionMaker?: RankedExecutive;
  confidence: number;
  apiCalls: string[];
};

/**
 * Analyze OCR data and fill in missing fields using all available APIs
 */
export async function autoFillContact(ocrData: OCRData): Promise<AutoFillResult> {
  const result: AutoFillResult = {
    filled: { ...ocrData },
    source: 'original',
    autoFilledFields: [],
    confidence: 100,
    apiCalls: [],
  };

  const hasName = !!(ocrData.firstName && ocrData.lastName);
  const hasCompany = !!ocrData.company;
  const hasEmail = !!ocrData.email;
  const hasPhone = !!ocrData.phone;

  console.log('🔍 Auto-fill analysis:', { hasName, hasCompany, hasEmail, hasPhone });

  // Scenario 1: Only email - reverse lookup
  if (hasEmail && !hasName && !hasCompany) {
    console.log('📧 Scenario: Email only - attempting reverse lookup');
    const personInfo = await lookupPersonByEmail(ocrData.email!);
    result.apiCalls.push('apollo:email_lookup');

    if (personInfo) {
      if (personInfo.firstName) {
        result.filled.firstName = personInfo.firstName;
        result.autoFilledFields.push('firstName');
      }
      if (personInfo.lastName) {
        result.filled.lastName = personInfo.lastName;
        result.autoFilledFields.push('lastName');
      }
      if (personInfo.company) {
        result.filled.company = personInfo.company;
        result.autoFilledFields.push('company');
      }
      if (personInfo.title) {
        result.filled.jobTitle = personInfo.title;
        result.autoFilledFields.push('jobTitle');
      }
      if (personInfo.phone && !hasPhone) {
        result.filled.phone = personInfo.phone;
        result.autoFilledFields.push('phone');
      }
      result.source = 'apollo';
      result.confidence = 85;
    }
    return result;
  }

  // Scenario 2: Company only (no name) - find decision maker
  if (hasCompany && !hasName) {
    console.log('🏢 Scenario: Company only - finding decision makers');

    // Try Apollo first for direct company search (faster, includes email/phone)
    const apolloPeople = await searchPeopleAtCompany(ocrData.company!, ocrData.website || undefined);
    result.apiCalls.push('apollo:company_search');

    if (apolloPeople.length > 0) {
      // Convert to Executive format for ranking
      const executives: Executive[] = apolloPeople.map(p => ({
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        title: p.title || 'Unknown',
        linkedin_url: p.linkedinUrl,
      }));

      const ranked = rankDecisionMakers(executives);
      result.decisionMakers = ranked;

      // Select top decision maker
      const topPerson = apolloPeople[0];
      const topRanked = ranked[0];

      if (topPerson.firstName) {
        result.filled.firstName = topPerson.firstName;
        result.autoFilledFields.push('firstName');
      }
      if (topPerson.lastName) {
        result.filled.lastName = topPerson.lastName;
        result.autoFilledFields.push('lastName');
      }
      if (topPerson.title) {
        result.filled.jobTitle = topPerson.title;
        result.autoFilledFields.push('jobTitle');
      }
      if (topPerson.email && !hasEmail) {
        result.filled.email = topPerson.email;
        result.autoFilledFields.push('email');
      }
      if (topPerson.phone && !hasPhone) {
        result.filled.phone = topPerson.phone;
        result.autoFilledFields.push('phone');
      }

      result.selectedDecisionMaker = topRanked;
      result.source = 'apollo';
      result.confidence = 80;
      return result;
    }

    // Fallback to Perplexity if Apollo didn't find anyone
    console.log('🔄 Apollo found no one, trying Perplexity...');
    const perplexityData = await researchCompanyWithPerplexity(ocrData.company!, ocrData.website);
    result.apiCalls.push('perplexity:company_research');

    if (perplexityData.executives && perplexityData.executives.length > 0) {
      const ranked = rankDecisionMakers(perplexityData.executives);
      result.decisionMakers = ranked;

      // Select top decision maker
      const topExec = ranked[0];
      result.selectedDecisionMaker = topExec;

      // Parse name
      const nameParts = topExec.name.trim().split(/\s+/);
      result.filled.firstName = nameParts[0] || null;
      result.filled.lastName = nameParts.slice(1).join(' ') || null;
      result.filled.jobTitle = topExec.title;

      if (result.filled.firstName) result.autoFilledFields.push('firstName');
      if (result.filled.lastName) result.autoFilledFields.push('lastName');
      result.autoFilledFields.push('jobTitle');

      // Now enrich with Apollo for email/phone
      if (!hasEmail || !hasPhone) {
        const apolloEnrichment = await enrichExecutiveWithApollo(topExec, ocrData.company!);
        result.apiCalls.push('apollo:executive_enrich');

        if (apolloEnrichment) {
          if (apolloEnrichment.email && !hasEmail) {
            result.filled.email = apolloEnrichment.email;
            result.autoFilledFields.push('email');
          }
          if (apolloEnrichment.phone && !hasPhone) {
            result.filled.phone = apolloEnrichment.phone;
            result.autoFilledFields.push('phone');
          }
          if (apolloEnrichment.linkedin_url) {
            // Store for later use
          }
        }
      }

      result.source = 'combined';
      result.confidence = 75;

      // Also store additional company data
      if (perplexityData.company_description) {
        // Could be used for AI summary later
      }
    } else if (perplexityData.founders && perplexityData.founders.length > 0) {
      // Use founders if no executives found
      const founder = perplexityData.founders[0];
      const nameParts = founder.trim().split(/\s+/);
      result.filled.firstName = nameParts[0] || null;
      result.filled.lastName = nameParts.slice(1).join(' ') || null;
      result.filled.jobTitle = 'Founder';

      if (result.filled.firstName) result.autoFilledFields.push('firstName');
      if (result.filled.lastName) result.autoFilledFields.push('lastName');
      result.autoFilledFields.push('jobTitle');

      result.source = 'perplexity';
      result.confidence = 70;
    }

    return result;
  }

  // Scenario 3: Has name and company, missing email/phone
  if (hasName && hasCompany && (!hasEmail || !hasPhone)) {
    console.log('👤 Scenario: Name + Company - enriching with Apollo');

    const apolloResult = await enrichContactWithApollo({
      firstName: ocrData.firstName!,
      lastName: ocrData.lastName!,
      company: ocrData.company!,
    });
    result.apiCalls.push('apollo:person_enrich');

    if (apolloResult) {
      if (apolloResult.email && !hasEmail) {
        result.filled.email = apolloResult.email;
        result.autoFilledFields.push('email');
      }
      if (apolloResult.phone && !hasPhone) {
        result.filled.phone = apolloResult.phone;
        result.autoFilledFields.push('phone');
      }
      result.source = 'apollo';
      result.confidence = 90;
    }

    return result;
  }

  // Scenario 4: Has name but no company - try to find company
  if (hasName && !hasCompany && hasEmail) {
    console.log('👤 Scenario: Name + Email, no company - looking up');

    // Extract domain from email as potential company hint
    const emailDomain = ocrData.email!.split('@')[1];
    if (emailDomain && !emailDomain.includes('gmail') && !emailDomain.includes('yahoo') && !emailDomain.includes('hotmail')) {
      // Business email - use domain as company hint
      const apolloResult = await enrichContactWithApollo({
        firstName: ocrData.firstName!,
        lastName: ocrData.lastName!,
        domain: emailDomain,
      });
      result.apiCalls.push('apollo:domain_enrich');

      if (apolloResult?.organization) {
        result.filled.company = apolloResult.organization.name;
        result.autoFilledFields.push('company');
        if (apolloResult.phone && !hasPhone) {
          result.filled.phone = apolloResult.phone;
          result.autoFilledFields.push('phone');
        }
        result.source = 'apollo';
        result.confidence = 85;
      }
    }

    return result;
  }

  // Scenario 5: All data present - no action needed
  console.log('✅ All fields present, no auto-fill needed');
  return result;
}

/**
 * Get a summary of what was auto-filled
 */
export function getAutoFillSummary(result: AutoFillResult): string {
  if (result.autoFilledFields.length === 0) {
    return '';
  }

  const fieldLabels: Record<string, string> = {
    firstName: 'first name',
    lastName: 'last name',
    company: 'company',
    jobTitle: 'job title',
    email: 'email',
    phone: 'phone',
  };

  const filledLabels = result.autoFilledFields.map(f => fieldLabels[f] || f);

  if (result.selectedDecisionMaker) {
    return `Auto-filled ${filledLabels.join(', ')} from ${result.selectedDecisionMaker.title} at ${result.filled.company}`;
  }

  return `Auto-filled ${filledLabels.join(', ')} via ${result.source}`;
}
