// GoHighLevel CRM Integration Service
// Handles contact sync with retry logic and encryption

import { getContact } from '@/lib/database/contacts';
import type { Contact } from '@/lib/database/contacts';

// ============================================================================
// TYPES
// ============================================================================

export type GHLCredentials = {
  apiKey: string;
  locationId: string;
};

export type GHLContact = {
  firstName?: string;
  lastName?: string;
  email: string; // Required by GHL
  phone?: string;
  companyName?: string;
  website?: string;
  source?: string;
  tags?: string[];
  customField?: Record<string, string>;
};

export type GHLSyncResult = {
  success: boolean;
  ghlContactId?: string;
  error?: string;
  errorCode?: number;
};

type GHLIntegration = {
  access_token: string; // Encrypted API key
  ghl_location_id: string;
  sync_tags: string[] | null;
};

// ============================================================================
// ENCRYPTION (Server-side only)
// ============================================================================

/**
 * Encrypt API key using server-side secret
 * Uses Web Crypto API with AES-GCM
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be at least 32 characters');
  }

  // Create encryption key from secret
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    encoder.encode(apiKey)
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Return as base64
  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt API key using server-side secret
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be at least 32 characters');
  }

  try {
    // Parse base64
    const combined = Buffer.from(encrypted, 'base64');
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Create decryption key
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret.slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      data
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

// ============================================================================
// GHL API CLIENT
// ============================================================================

// V1 API base URL - used for Business Profile API keys (JWT tokens)
const GHL_API_V1 = 'https://rest.gohighlevel.com/v1';

/**
 * Search for contact in GHL by email
 */
async function searchGHLContact(
  credentials: GHLCredentials,
  email: string
): Promise<{ exists: boolean; contactId?: string }> {
  try {
    const response = await fetch(
      `${GHL_API_V1}/contacts/?locationId=${credentials.locationId}&email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('GHL search failed:', response.status, await response.text());
      return { exists: false };
    }

    const data = await response.json();
    const contacts = data.contacts || [];

    if (contacts.length > 0) {
      return { exists: true, contactId: contacts[0].id };
    }

    return { exists: false };
  } catch (error) {
    console.error('GHL search error:', error);
    return { exists: false };
  }
}

/**
 * Create new contact in GHL
 */
async function createGHLContact(
  credentials: GHLCredentials,
  contact: GHLContact
): Promise<GHLSyncResult> {
  try {
    const response = await fetch(`${GHL_API_V1}/contacts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...contact,
        locationId: credentials.locationId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GHL create failed:', response.status, data);
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        errorCode: response.status,
      };
    }

    return {
      success: true,
      ghlContactId: data.contact?.id || data.id,
    };
  } catch (error) {
    console.error('GHL create error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update existing contact in GHL
 */
async function updateGHLContact(
  credentials: GHLCredentials,
  ghlContactId: string,
  contact: GHLContact
): Promise<GHLSyncResult> {
  try {
    const response = await fetch(`${GHL_API_V1}/contacts/${ghlContactId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GHL update failed:', response.status, data);
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        errorCode: response.status,
      };
    }

    return {
      success: true,
      ghlContactId: data.contact?.id || ghlContactId,
    };
  } catch (error) {
    console.error('GHL update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Retry function with exponential backoff
 * - Attempt 1: Immediate
 * - Attempt 2: 5 second delay
 * - Attempt 3: 30 second delay
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryableErrors = [429, 503, 500]
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      // Check if result indicates a retryable error
      if (
        result &&
        typeof result === 'object' &&
        'errorCode' in result &&
        retryableErrors.includes((result as any).errorCode)
      ) {
        lastError = result;

        if (attempt < maxRetries) {
          const delay = attempt === 1 ? 0 : attempt === 2 ? 5000 : 30000;
          console.log(`GHL API retryable error, attempt ${attempt}/${maxRetries}, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      return result;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = attempt === 1 ? 0 : attempt === 2 ? 5000 : 30000;
        console.log(`GHL API error, attempt ${attempt}/${maxRetries}, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
}

// ============================================================================
// MAIN SYNC FUNCTION
// ============================================================================

/**
 * Sync a Network Buddy contact to GoHighLevel
 * This is the main entry point called after enrichment
 */
export async function syncContactToGHL(contactId: string): Promise<GHLSyncResult> {
  try {
    // 1. Get contact from database
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    // 2. Check if contact has email (required by GHL)
    if (!contact.email) {
      console.log(`Skipping GHL sync for contact ${contactId}: no email`);
      return { success: true }; // Not an error, just skip
    }

    // 3. Get GHL integration for this user
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: integration, error: integrationError } = await supabase
      .from('ghl_integrations')
      .select('access_token, ghl_location_id, auto_sync, sync_tags')
      .eq('user_id', contact.user_id)
      .single();

    if (integrationError || !integration) {
      console.log(`No GHL integration for user ${contact.user_id}`);
      return { success: true }; // Not an error, just skip
    }

    // 4. Check if auto_sync is enabled
    const typedIntegration = integration as unknown as GHLIntegration;
    if ((integration as any).auto_sync === false) {
      console.log(`Auto-sync disabled for user ${contact.user_id}`);
      return { success: true }; // Not an error, just skip
    }

    // 5. Decrypt API key
    const apiKey = await decryptApiKey(typedIntegration.access_token);
    const credentials: GHLCredentials = {
      apiKey,
      locationId: typedIntegration.ghl_location_id,
    };

    // 6. Map Network Buddy contact to GHL format
    const ghlContact: GHLContact = {
      firstName: contact.first_name || undefined,
      lastName: contact.last_name || undefined,
      email: contact.email,
      phone: contact.phone || undefined,
      companyName: contact.company || undefined,
      website: contact.company_website || undefined,
      source: 'Network Buddy',
      tags: [
        ...(typedIntegration.sync_tags || []),
        ...(contact.tags || []),
      ],
      customField: {
        ...(contact.linkedin_url && { linkedin: contact.linkedin_url }),
        ...(contact.job_title && { jobTitle: contact.job_title }),
        ...(contact.reputation_score && { reputation: contact.reputation_score.toString() }),
        ...(contact.ai_summary && {
          aiSummary: contact.ai_summary.substring(0, 500), // Truncate
        }),
      },
    };

    // 7. Check if contact already exists in GHL
    const searchResult = await searchGHLContact(credentials, contact.email);

    // 8. Create or update with retry logic
    let syncResult: GHLSyncResult;

    if (searchResult.exists && searchResult.contactId) {
      // Update existing
      syncResult = await withRetry(() =>
        updateGHLContact(credentials, searchResult.contactId!, ghlContact)
      );
    } else {
      // Create new
      syncResult = await withRetry(() =>
        createGHLContact(credentials, ghlContact)
      );
    }

    return syncResult;
  } catch (error) {
    console.error('GHL sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test GHL connection with given credentials
 * Used when user connects their GHL account
 *
 * Uses V1 API which works with Business Profile API keys (JWT tokens)
 */
export async function testGHLConnection(
  apiKey: string,
  locationId: string
): Promise<boolean> {
  try {
    // Use V1 contacts endpoint - works with Business Profile API keys
    const response = await fetch(
      `${GHL_API_V1}/contacts/?locationId=${locationId}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 200 = success (even with 0 results)
    // 401 = invalid API key
    // 400 = invalid location ID
    if (response.ok) {
      return true;
    }

    // Log the error for debugging
    const errorText = await response.text();
    console.error('GHL connection test failed:', response.status, errorText);
    return false;
  } catch (error) {
    console.error('GHL connection test error:', error);
    return false;
  }
}
