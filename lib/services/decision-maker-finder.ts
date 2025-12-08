// Decision Maker Finder Service
// Intelligently ranks executives/founders by decision-making authority

// ============================================================================
// TYPES
// ============================================================================

export type Executive = {
  name: string;
  title: string;
  linkedin_url: string | null;
};

export type RankedExecutive = Executive & {
  decision_maker_score: number;
  decision_maker_rank: number;
  is_primary_decision_maker: boolean;
};

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

/**
 * Title-based scoring system
 * Higher scores = More likely to be a decision maker
 */
const TITLE_SCORES: Record<string, number> = {
  // C-Suite (Highest Authority)
  ceo: 100,
  'chief executive': 100,
  founder: 95,
  'co-founder': 95,
  cofounder: 95,
  president: 90,

  // Senior Operations
  coo: 85,
  'chief operating': 85,

  // Technology
  cto: 80,
  'chief technology': 80,
  cio: 80,
  'chief information': 80,

  // Finance
  cfo: 80,
  'chief financial': 80,

  // Other C-Suite
  cmo: 75,
  'chief marketing': 75,
  cpo: 75,
  'chief product': 75,

  // Senior VPs
  svp: 75,
  'senior vice president': 75,
  'senior vp': 75,

  // Vice Presidents
  vp: 70,
  'vice president': 70,

  // Directors
  director: 60,
  'senior director': 65,

  // Managers
  manager: 40,
  'senior manager': 45,

  // Individual Contributors (Low Authority)
  engineer: 20,
  developer: 20,
  analyst: 20,
  coordinator: 15,
};

/**
 * Calculate decision maker score for an executive
 * Scores range from 0-100
 */
function scoreExecutive(exec: Executive): number {
  const titleLower = exec.title.toLowerCase();

  // Find best matching title score
  let baseScore = 30; // Default for unknown titles
  for (const [keyword, score] of Object.entries(TITLE_SCORES)) {
    if (titleLower.includes(keyword)) {
      baseScore = Math.max(baseScore, score);
    }
  }

  // Apply bonuses
  let bonus = 0;

  // LinkedIn URL bonus (shows credibility)
  if (exec.linkedin_url) {
    bonus += 10;
  }

  // "Chief" keyword bonus (C-Suite indicator)
  if (titleLower.includes('chief')) {
    bonus += 5;
  }

  // "Head of" bonus (Department leadership)
  if (titleLower.includes('head of')) {
    bonus += 5;
  }

  // "Owner" or "Partner" bonus (Ownership stake)
  if (titleLower.includes('owner') || titleLower.includes('partner')) {
    bonus += 10;
  }

  // Cap at 100
  return Math.min(baseScore + bonus, 100);
}

/**
 * Rank executives by decision-making authority
 * Returns top 5 decision makers, sorted by score
 */
export function rankDecisionMakers(executives: Executive[]): RankedExecutive[] {
  if (!executives || executives.length === 0) {
    return [];
  }

  // Score each executive
  const scored = executives.map(exec => ({
    ...exec,
    decision_maker_score: scoreExecutive(exec),
    decision_maker_rank: 0, // Will be assigned below
    is_primary_decision_maker: false, // Will be assigned below
  }));

  // Sort by score descending
  scored.sort((a, b) => {
    // Primary sort: score
    if (b.decision_maker_score !== a.decision_maker_score) {
      return b.decision_maker_score - a.decision_maker_score;
    }
    // Tiebreaker: LinkedIn URL presence
    if (a.linkedin_url && !b.linkedin_url) return -1;
    if (!a.linkedin_url && b.linkedin_url) return 1;
    // Final tiebreaker: alphabetical by name
    return a.name.localeCompare(b.name);
  });

  // Assign ranks (1, 2, 3...)
  scored.forEach((exec, idx) => {
    exec.decision_maker_rank = idx + 1;
    exec.is_primary_decision_maker = idx === 0;
  });

  // Return top 5 only
  return scored.slice(0, 5);
}

/**
 * Check if decision makers should be shown for a contact
 * Show if: contact has company but missing personal info
 */
export function shouldShowDecisionMakers(contact: {
  company: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  executives: RankedExecutive[] | null;
}): boolean {
  return Boolean(
    contact.company &&
      (!contact.first_name || !contact.last_name || !contact.email) &&
      contact.executives &&
      contact.executives.length > 0 &&
      contact.executives.some(e => e.decision_maker_rank && e.linkedin_url)
  );
}

/**
 * Get decision maker summary for display
 * Returns formatted string for UI
 */
export function getDecisionMakerSummary(executives: RankedExecutive[]): string {
  if (!executives || executives.length === 0) {
    return 'No decision makers found';
  }

  const primary = executives.find(e => e.is_primary_decision_maker);
  if (!primary) {
    return `${executives.length} decision makers identified`;
  }

  const title = primary.title.split(' ')[0]; // First word of title
  return `${primary.name} (${title}) and ${executives.length - 1} other${
    executives.length > 2 ? 's' : ''
  }`;
}
