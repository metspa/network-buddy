// Database operations for GoHighLevel integrations
// Handles CRUD for ghl_integrations table

import { createClient } from '@/lib/supabase/server';
import { encryptApiKey, decryptApiKey, testGHLConnection } from '@/lib/services/gohighlevel';

// ============================================================================
// TYPES
// ============================================================================

export type GHLIntegration = {
  id: string;
  user_id: string;
  access_token: string; // Encrypted API key
  refresh_token: string | null;
  token_expires_at: string | null;
  ghl_location_id: string;
  ghl_company_id: string | null;
  auto_sync: boolean;
  sync_tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type GHLIntegrationInput = {
  apiKey: string; // Plain text, will be encrypted
  locationId: string;
  companyId?: string;
  autoSync?: boolean;
  tags?: string[];
};

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get GHL integration for authenticated user
 */
export async function getGHLIntegration(): Promise<GHLIntegration | null> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Query integration
  const { data, error } = await supabase
    .from('ghl_integrations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching GHL integration:', error);
    throw new Error('Failed to fetch GHL integration');
  }

  return data as GHLIntegration;
}

/**
 * Get GHL integration for specific user (used internally)
 */
export async function getGHLIntegrationByUserId(
  userId: string
): Promise<GHLIntegration | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ghl_integrations')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching GHL integration:', error);
    return null;
  }

  return data as GHLIntegration;
}

/**
 * Create or update GHL integration for authenticated user
 */
export async function upsertGHLIntegration(
  input: GHLIntegrationInput
): Promise<GHLIntegration> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Test connection before saving
  const isValid = await testGHLConnection(input.apiKey, input.locationId);
  if (!isValid) {
    throw new Error('Invalid GHL API Key or Location ID');
  }

  // Encrypt API key
  const encryptedApiKey = await encryptApiKey(input.apiKey);

  // Upsert integration
  const { data, error } = await supabase
    .from('ghl_integrations')
    .upsert(
      {
        user_id: user.id,
        access_token: encryptedApiKey,
        refresh_token: null, // Not used for API key auth
        token_expires_at: null, // API keys don't expire
        ghl_location_id: input.locationId,
        ghl_company_id: input.companyId || null,
        auto_sync: input.autoSync !== undefined ? input.autoSync : true,
        sync_tags: input.tags || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting GHL integration:', error);
    throw new Error('Failed to save GHL integration');
  }

  return data as GHLIntegration;
}

/**
 * Delete GHL integration for authenticated user
 */
export async function deleteGHLIntegration(): Promise<void> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Delete integration
  const { error } = await supabase
    .from('ghl_integrations')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting GHL integration:', error);
    throw new Error('Failed to delete GHL integration');
  }
}

/**
 * Test GHL connection with given credentials
 * This is used when user is setting up integration
 */
export async function testConnection(
  apiKey: string,
  locationId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const isValid = await testGHLConnection(apiKey, locationId);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid API Key or Location ID',
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}

/**
 * Get decrypted API key for a user (internal use only)
 * Used by sync service to authenticate with GHL
 */
export async function getDecryptedApiKey(userId: string): Promise<string | null> {
  const integration = await getGHLIntegrationByUserId(userId);
  if (!integration) {
    return null;
  }

  try {
    return await decryptApiKey(integration.access_token);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}

/**
 * Check if user has GHL integration enabled
 */
export async function hasGHLIntegration(): Promise<boolean> {
  try {
    const integration = await getGHLIntegration();
    return integration !== null && integration.auto_sync === true;
  } catch (error) {
    return false;
  }
}

/**
 * Get integration settings for display (without API key)
 */
export async function getGHLSettings(): Promise<{
  connected: boolean;
  locationId?: string;
  companyId?: string;
  autoSync?: boolean;
  tags?: string[];
  createdAt?: string;
} | null> {
  try {
    const integration = await getGHLIntegration();
    if (!integration) {
      return { connected: false };
    }

    return {
      connected: true,
      locationId: integration.ghl_location_id,
      companyId: integration.ghl_company_id || undefined,
      autoSync: integration.auto_sync,
      tags: integration.sync_tags || undefined,
      createdAt: integration.created_at,
    };
  } catch (error) {
    return { connected: false };
  }
}
