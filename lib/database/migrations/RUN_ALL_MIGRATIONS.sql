-- ============================================
-- COMBINED MIGRATION SCRIPT FOR NETWORK BUDDY
-- Run this ENTIRE script in Supabase SQL Editor
-- Date: 2025-12-16
-- ============================================

-- STEP 1: Add Enhanced Enrichment Fields (from 20250106_add_enhanced_enrichment_fields.sql)
-- ============================================

-- Image classification
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS image_type TEXT;

-- Deep Company Data (from Perplexity AI)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_revenue TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_funding TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_founded INTEGER;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_employees TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS founders TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS executives JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS competitors TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS technologies TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS job_openings INTEGER;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS locations TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS crunchbase_url TEXT;

-- Social Media Profiles (CRITICAL - This is what's missing!)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Indexes for enhanced fields
CREATE INDEX IF NOT EXISTS contacts_image_type_idx ON contacts(image_type);
CREATE INDEX IF NOT EXISTS contacts_company_size_idx ON contacts(company_size);
CREATE INDEX IF NOT EXISTS contacts_company_founded_idx ON contacts(company_founded);
CREATE INDEX IF NOT EXISTS contacts_social_media_gin_idx ON contacts USING GIN (social_media);
CREATE INDEX IF NOT EXISTS contacts_executives_gin_idx ON contacts USING GIN (executives);

-- STEP 2: Add GMB Reviews & Photos (from 20250106_add_gmb_reviews_photos.sql)
-- ============================================

-- GMB detailed reviews (up to 10)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_reviews JSONB;

-- GMB business photos (up to 20)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_photos JSONB;

-- GMB place ID and hours
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_place_id TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_hours TEXT;

-- Indexes for GMB data
CREATE INDEX IF NOT EXISTS contacts_gmb_reviews_gin_idx ON contacts USING GIN (gmb_reviews);
CREATE INDEX IF NOT EXISTS contacts_gmb_photos_gin_idx ON contacts USING GIN (gmb_photos);
CREATE INDEX IF NOT EXISTS contacts_gmb_place_id_idx ON contacts(gmb_place_id);

-- STEP 3: Add SMS & Email Templates (from 20251209_add_sms_email_templates.sql)
-- ============================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sms_templates JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_templates JSONB;

-- STEP 4: Add Address Column (from add_address_column.sql)
-- ============================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;

-- STEP 5: Add Scan Location Fields (from 20251209_add_scan_location.sql)
-- ============================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_latitude DECIMAL(10, 8);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_longitude DECIMAL(11, 8);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_location_accuracy DECIMAL(10, 2);

-- STEP 6: Add User Personalization Table (from 20251209_add_user_personalization.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS user_personalization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- Business context
  user_role TEXT,
  user_industry TEXT,
  company_name TEXT,
  company_description TEXT,
  target_customers TEXT,
  services_offered TEXT[],

  -- Communication style
  communication_tone TEXT DEFAULT 'professional',
  preferred_icebreaker_style TEXT DEFAULT 'business',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own personalization" ON user_personalization;

-- RLS Policy
CREATE POLICY "Users can manage their own personalization"
  ON user_personalization FOR ALL
  USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_personalization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_personalization_updated_at ON user_personalization;

CREATE TRIGGER update_personalization_updated_at
  BEFORE UPDATE ON user_personalization
  FOR EACH ROW
  EXECUTE FUNCTION update_personalization_updated_at();

-- STEP 7: Add User Credits Table (from 20250107_create_user_credits.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  credits_balance INTEGER DEFAULT 0,
  lifetime_credits_purchased INTEGER DEFAULT 0,
  lifetime_credits_used INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;

CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- STEP 8: Add Enrichment Transactions Table
-- ============================================

CREATE TABLE IF NOT EXISTS enrichment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  transaction_type TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,

  source TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS enrichment_transactions_user_id_idx ON enrichment_transactions(user_id);
CREATE INDEX IF NOT EXISTS enrichment_transactions_created_at_idx ON enrichment_transactions(created_at DESC);

ALTER TABLE enrichment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON enrichment_transactions;

CREATE POLICY "Users can view their own transactions"
  ON enrichment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- STEP 9: Update Subscriptions Table
-- ============================================

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS enrichment_credits_per_month INTEGER DEFAULT 0;

-- ============================================
-- VERIFICATION QUERY
-- Run this after to verify all columns exist:
-- ============================================

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'contacts'
-- ORDER BY ordinal_position;

-- ============================================
-- DONE! All migrations applied.
-- ============================================
