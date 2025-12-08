// Service Provider Detection - Auto-detect service providers from job titles and company names

export type ServiceCategory =
  | 'plumber'
  | 'roofer'
  | 'electrician'
  | 'hvac'
  | 'contractor'
  | 'landscaper'
  | 'painter'
  | 'carpenter'
  | 'mechanic'
  | 'cleaner'
  | 'handyman'
  | null;

const SERVICE_PROVIDER_KEYWORDS: Record<string, string[]> = {
  plumber: ['plumb', 'pipe', 'drain', 'plumbing', 'pipefitter'],
  roofer: ['roof', 'gutter', 'shingle', 'roofing', 'roofer'],
  electrician: ['electric', 'wiring', 'electrical', 'electrician'],
  hvac: ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ventilation'],
  contractor: ['contractor', 'construction', 'builder', 'remodel', 'renovation', 'general contractor'],
  landscaper: ['landscape', 'lawn', 'yard', 'garden', 'landscaping', 'lawn care', 'tree service'],
  painter: ['paint', 'painting', 'painter', 'drywall'],
  carpenter: ['carpenter', 'woodwork', 'cabinet', 'carpentry', 'cabinetry'],
  mechanic: ['mechanic', 'auto repair', 'car repair', 'automotive', 'auto service'],
  cleaner: ['cleaning', 'janitorial', 'maid', 'housekeeping', 'carpet cleaning'],
  handyman: ['handyman', 'repair', 'maintenance', 'home repair', 'odd jobs'],
};

export type ServiceProviderDetectionResult = {
  isServiceProvider: boolean;
  category: ServiceCategory;
  matchedKeywords?: string[];
};

/**
 * Detect if a contact is a service provider based on job title and company name
 * Uses keyword matching across common service provider categories
 */
export function detectServiceProvider(
  jobTitle: string | null,
  company: string | null
): ServiceProviderDetectionResult {
  // Combine job title and company name for search
  const text = `${jobTitle || ''} ${company || ''}`.toLowerCase().trim();

  if (!text) {
    return { isServiceProvider: false, category: null };
  }

  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(SERVICE_PROVIDER_KEYWORDS)) {
    const matchedKeywords = keywords.filter((keyword) => text.includes(keyword));

    if (matchedKeywords.length > 0) {
      return {
        isServiceProvider: true,
        category: category as ServiceCategory,
        matchedKeywords,
      };
    }
  }

  return { isServiceProvider: false, category: null };
}

/**
 * Get a human-readable category name
 */
export function getCategoryDisplayName(category: ServiceCategory): string {
  if (!category) return '';

  const displayNames: Record<string, string> = {
    plumber: 'Plumbing',
    roofer: 'Roofing',
    electrician: 'Electrical',
    hvac: 'HVAC',
    contractor: 'General Contracting',
    landscaper: 'Landscaping',
    painter: 'Painting',
    carpenter: 'Carpentry',
    mechanic: 'Auto Repair',
    cleaner: 'Cleaning Services',
    handyman: 'Handyman Services',
  };

  return displayNames[category] || category;
}

/**
 * Check if a specific category matches
 */
export function isCategory(category: ServiceCategory, targetCategory: string): boolean {
  return category === targetCategory;
}

/**
 * Get all available service categories
 */
export function getAllServiceCategories(): string[] {
  return Object.keys(SERVICE_PROVIDER_KEYWORDS);
}
