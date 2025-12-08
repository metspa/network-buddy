// Enrichment cache management with 30-day TTL
import { createClient } from '@/lib/supabase/server';

export type CacheType = 'linkedin' | 'company' | 'news' | 'reputation' | 'gmb' | 'perplexity' | 'social';

/**
 * Get cached enrichment data
 * Returns null if cache miss or expired
 */
export async function getCachedData(
  cacheKey: string,
  cacheType: CacheType
): Promise<any | null> {
  try {
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
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached enrichment data with TTL
 * Default TTL is 30 days
 */
export async function setCachedData(
  cacheKey: string,
  cacheType: CacheType,
  data: any,
  ttlDays: number = 30
): Promise<void> {
  try {
    const supabase = await createClient();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    // Upsert cache entry
    const { error } = await supabase.from('enrichment_cache').upsert(
      {
        cache_key: cacheKey,
        cache_type: cacheType,
        data,
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: 'cache_key',
      }
    );

    if (error) {
      console.error('Cache set error:', error);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Generate cache key for LinkedIn profile
 */
export function getLinkedInCacheKey(firstName: string, lastName: string, company?: string): string {
  const nameKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  const companyKey = company ? `_${company.toLowerCase().replace(/\s+/g, '_')}` : '';
  return `linkedin:${nameKey}${companyKey}`;
}

/**
 * Generate cache key for company info
 */
export function getCompanyCacheKey(companyName: string): string {
  return `company:${companyName.toLowerCase().replace(/\s+/g, '_')}`;
}

/**
 * Generate cache key for company news
 */
export function getNewsCacheKey(companyName: string): string {
  return `news:${companyName.toLowerCase().replace(/\s+/g, '_')}`;
}

/**
 * Invalidate cache entry
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('enrichment_cache')
      .delete()
      .eq('cache_key', cacheKey);

    if (error) {
      console.error('Cache invalidation error:', error);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Clean up expired cache entries
 * Should be run periodically (e.g., daily cron job)
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('enrichment_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  total: number;
  linkedin: number;
  company: number;
  news: number;
  reputation: number;
  gmb: number;
  expired: number;
}> {
  try {
    const supabase = await createClient();

    // Total entries
    const { count: total } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true });

    // By type
    const { count: linkedin } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_type', 'linkedin');

    const { count: company } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_type', 'company');

    const { count: news } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_type', 'news');

    const { count: reputation } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_type', 'reputation');

    const { count: gmb } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_type', 'gmb');

    // Expired
    const { count: expired } = await supabase
      .from('enrichment_cache')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    return {
      total: total || 0,
      linkedin: linkedin || 0,
      company: company || 0,
      news: news || 0,
      reputation: reputation || 0,
      gmb: gmb || 0,
      expired: expired || 0,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      total: 0,
      linkedin: 0,
      company: 0,
      news: 0,
      reputation: 0,
      gmb: 0,
      expired: 0,
    };
  }
}
