-- Migration: Create Enrichment Transactions Table
-- Date: 2025-01-07
-- Description: Adds enrichment_transactions table for detailed usage tracking
-- Part of: Apollo.io Integration & Pricing Strategy Redesign

-- ============================================
-- CREATE ENRICHMENT_TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enrichment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Transaction details
  source_type TEXT NOT NULL, -- 'subscription', 'credits'
  enrichment_type TEXT NOT NULL, -- 'basic', 'apollo'
  cost_estimate DECIMAL(10,4), -- Estimated cost in USD

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS enrichment_transactions_user_id_idx ON enrichment_transactions(user_id);
CREATE INDEX IF NOT EXISTS enrichment_transactions_created_at_idx ON enrichment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS enrichment_transactions_source_type_idx ON enrichment_transactions(source_type);
CREATE INDEX IF NOT EXISTS enrichment_transactions_enrichment_type_idx ON enrichment_transactions(enrichment_type);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE enrichment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON enrichment_transactions;

-- RLS Policy - Users can only view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON enrichment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS enrichment_transactions CASCADE;
