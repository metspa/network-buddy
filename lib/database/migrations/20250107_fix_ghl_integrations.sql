-- Migration: Fix GHL Integrations Table
-- Date: 2025-01-07
-- Description: Makes refresh_token and token_expires_at nullable (we use API key auth, not OAuth)
-- Part of: GoHighLevel Integration Cleanup

-- ============================================
-- MAKE OAUTH FIELDS NULLABLE
-- ============================================

-- Since we're using API Key authentication instead of OAuth,
-- these fields should be nullable

ALTER TABLE ghl_integrations
  ALTER COLUMN refresh_token DROP NOT NULL;

ALTER TABLE ghl_integrations
  ALTER COLUMN token_expires_at DROP NOT NULL;

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE ghl_integrations ALTER COLUMN refresh_token SET NOT NULL;
-- ALTER TABLE ghl_integrations ALTER COLUMN token_expires_at SET NOT NULL;
