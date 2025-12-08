-- Migration: Create User Credits Table
-- Date: 2025-01-07
-- Description: Adds user_credits table for credit purchase system
-- Part of: Apollo.io Integration & Pricing Strategy Redesign

-- ============================================
-- CREATE USER_CREDITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- Credit balances
  credits_balance INTEGER DEFAULT 0,
  credits_purchased_total INTEGER DEFAULT 0,
  credits_used_total INTEGER DEFAULT 0,

  -- Purchase tracking
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  last_purchase_amount INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS user_credits_user_id_idx ON user_credits(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;

-- RLS Policy - Users can only view their own credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- CREATE TRIGGER FUNCTION
-- ============================================

-- Function to create default credits record for new users
CREATE OR REPLACE FUNCTION create_default_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Trigger to create default credits for new users
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_credits();

-- ============================================
-- UPDATE TRIGGER FUNCTION
-- ============================================

-- Function to update credits updated_at timestamp
CREATE OR REPLACE FUNCTION update_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;

-- Create trigger
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_updated_at();

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
-- DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
-- DROP FUNCTION IF EXISTS create_default_credits();
-- DROP FUNCTION IF EXISTS update_credits_updated_at();
-- DROP TABLE IF EXISTS user_credits CASCADE;
