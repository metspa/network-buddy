// Contact database query helpers
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * Executive/Founder type with decision maker ranking fields
 */
export type Executive = {
  name: string;
  title: string;
  linkedin_url: string | null;
  // Optional fields added by decision maker ranking
  decision_maker_score?: number; // 0-100 score
  decision_maker_rank?: number; // 1, 2, 3...
  is_primary_decision_maker?: boolean; // true for rank #1
};

export type Contact = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  card_image_url: string;
  card_image_path: string;
  ocr_confidence: number | null;
  ocr_raw_text: string | null;
  enrichment_status: 'pending' | 'processing' | 'completed' | 'failed';
  enrichment_error: string | null;
  linkedin_url: string | null;
  company_website: string | null;
  company_industry: string | null;
  recent_news: string[] | null;
  ai_summary: string | null;
  icebreakers: string[] | null;
  is_service_provider: boolean;
  service_category: string | null;
  reputation_score: number | null;
  review_count: number | null;
  review_source: string | null;
  reputation_summary: string | null;
  website_status: string | null;
  reputation_checked_at: string | null;
  reputation_error: string | null;
  // NEW: GMB detailed reviews and photos (from SerpApi)
  gmb_reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
    likes: number;
  }[] | null;
  gmb_photos: {
    url: string;
    thumbnail: string;
    title?: string;
  }[] | null;
  gmb_place_id: string | null;
  gmb_hours: string | null;
  // NEW: Multi-modal OCR image classification
  image_type: 'business_card' | 'truck' | 'storefront' | 'ad' | 'sign' | 'other' | null;
  // NEW: Deep company data (from Perplexity AI)
  company_size: string | null;
  company_revenue: string | null;
  company_funding: string | null;
  company_founded: number | null;
  company_employees: string | null;
  company_description: string | null;
  founders: string[] | null;
  executives: Executive[] | null;
  competitors: string[] | null;
  technologies: string[] | null;
  job_openings: number | null;
  locations: string[] | null;
  crunchbase_url: string | null;
  // NEW: Social media profiles (from Serper/Perplexity)
  social_media: {
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    linkedin_company: string | null;
  } | null;
  // Existing fields
  ghl_contact_id: string | null;
  ghl_synced_at: string | null;
  ghl_sync_error: string | null;
  met_at: string | null;
  notes: string | null;
  tags: string[] | null;
  favorited: boolean;
  created_at: string;
  updated_at: string;
};

export type NewContact = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  card_image_url: string;
  card_image_path: string;
  ocr_confidence?: number;
  ocr_raw_text?: string;
  met_at?: string;
  notes?: string;
  tags?: string[];
};

export type ContactUpdate = Partial<Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ============================================
// SERVER-SIDE QUERIES (for API routes)
// ============================================

/**
 * Get all contacts for the authenticated user
 */
export async function getContacts(options?: {
  search?: string;
  enrichmentStatus?: Contact['enrichment_status'];
  tags?: string[];
  favorited?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`);
  }

  if (options?.enrichmentStatus) {
    query = query.eq('enrichment_status', options.enrichmentStatus);
  }

  if (options?.favorited !== undefined) {
    query = query.eq('favorited', options.favorited);
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.contains('tags', options.tags);
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data as Contact[];
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }

  return data as Contact;
}

/**
 * Create a new contact
 */
export async function createContact(contact: NewContact) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: user.id,
      ...contact,
      enrichment_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return data as Contact;
}

/**
 * Update an existing contact
 */
export async function updateContact(contactId: string, updates: ContactUpdate) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', contactId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }

  return data as Contact;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }

  return true;
}

/**
 * Get contacts count (for pagination)
 */
export async function getContactsCount(options?: {
  search?: string;
  enrichmentStatus?: Contact['enrichment_status'];
  tags?: string[];
  favorited?: boolean;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Apply same filters as getContacts
  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`);
  }

  if (options?.enrichmentStatus) {
    query = query.eq('enrichment_status', options.enrichmentStatus);
  }

  if (options?.favorited !== undefined) {
    query = query.eq('favorited', options.favorited);
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.contains('tags', options.tags);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count contacts: ${error.message}`);
  }

  return count || 0;
}

// ============================================
// CLIENT-SIDE QUERIES (for React components)
// ============================================

/**
 * Get contacts from the client side
 */
export async function getContactsClient(options?: {
  search?: string;
  enrichmentStatus?: Contact['enrichment_status'];
  tags?: string[];
  favorited?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = createBrowserClient();

  let query = supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters (same as server-side)
  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`);
  }

  if (options?.enrichmentStatus) {
    query = query.eq('enrichment_status', options.enrichmentStatus);
  }

  if (options?.favorited !== undefined) {
    query = query.eq('favorited', options.favorited);
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.contains('tags', options.tags);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data as Contact[];
}

/**
 * Get a single contact by ID (client-side)
 */
export async function getContactClient(contactId: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }

  return data as Contact;
}

// ============================================
// ENRICHMENT CACHE HELPERS
// ============================================

/**
 * Get cached enrichment data
 */
export async function getCachedEnrichment(cacheKey: string, cacheType: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('enrichment_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .eq('cache_type', cacheType)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return data.data;
}

/**
 * Set cached enrichment data
 */
export async function setCachedEnrichment(
  cacheKey: string,
  cacheType: string,
  data: any,
  ttlDays = 30
) {
  const supabase = await createClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  const { error } = await supabase.from('enrichment_cache').upsert({
    cache_key: cacheKey,
    cache_type: cacheType,
    data,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Failed to cache enrichment data:', error);
  }
}
