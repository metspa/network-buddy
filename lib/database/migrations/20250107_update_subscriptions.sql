-- Migration: Update Subscriptions Table
-- Date: 2025-01-07
-- Description: Adds includes_apollo column to track Apollo.io access
-- Part of: Apollo.io Integration & Pricing Strategy Redesign

-- ============================================
-- ADD INCLUDES_APOLLO COLUMN
-- ============================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS includes_apollo BOOLEAN DEFAULT false;

COMMENT ON COLUMN subscriptions.includes_apollo
  IS 'Whether subscription includes Apollo.io enrichment (Growth and Pro tiers)';

-- ============================================
-- UPDATE EXISTING SUBSCRIPTIONS
-- ============================================

-- Set Free tier to not include Apollo
UPDATE subscriptions
SET includes_apollo = false
WHERE plan_name = 'free';

-- Set Pro tier to include Apollo (if any exist)
UPDATE subscriptions
SET includes_apollo = true
WHERE plan_name = 'pro';

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS includes_apollo;
