-- Network Buddy Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE (Keep existing)
-- ============================================

-- Create a profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DROP OLD TABLES
-- ============================================

-- Drop posts table (no longer needed)
DROP TABLE IF EXISTS posts CASCADE;

-- ============================================
-- CONTACTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Extracted from business card
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,

  -- Card image stored in Supabase Storage
  card_image_url TEXT NOT NULL,
  card_image_path TEXT NOT NULL,

  -- OCR metadata
  ocr_confidence DECIMAL(5,2), -- 0-100
  ocr_raw_text TEXT,

  -- Enrichment status
  enrichment_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  enrichment_error TEXT,

  -- Research data (from Serper API)
  linkedin_url TEXT,
  company_website TEXT,
  company_industry TEXT,
  recent_news TEXT[], -- Array of recent news headlines

  -- AI-generated content (from OpenAI)
  ai_summary TEXT,
  icebreakers TEXT[], -- Array of conversation starters

  -- Service Provider Reputation (NEW - Google Places API)
  is_service_provider BOOLEAN DEFAULT false,
  service_category TEXT, -- plumber, roofer, electrician, etc.
  reputation_score DECIMAL(3,1), -- 0.0-5.0 star rating
  review_count INTEGER, -- Number of reviews
  review_source TEXT, -- 'google' for Google My Business
  reputation_summary TEXT, -- AI-generated reputation insight
  website_status TEXT, -- 'active', 'none', 'inactive'
  reputation_checked_at TIMESTAMP WITH TIME ZONE,
  reputation_error TEXT,

  -- CRM sync (GoHighLevel)
  ghl_contact_id TEXT,
  ghl_synced_at TIMESTAMP WITH TIME ZONE,
  ghl_sync_error TEXT,

  -- User metadata
  met_at TEXT, -- Event name or location
  notes TEXT,
  tags TEXT[], -- User-defined tags
  favorited BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
CREATE INDEX IF NOT EXISTS contacts_enrichment_status_idx ON contacts(enrichment_status);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_reputation_score_idx ON contacts(reputation_score);
CREATE INDEX IF NOT EXISTS contacts_service_provider_idx ON contacts(is_service_provider);
CREATE INDEX IF NOT EXISTS contacts_service_category_idx ON contacts(service_category);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

-- RLS Policies - Users can only access their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ENRICHMENT CACHE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enrichment_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Cache key (email or LinkedIn URL)
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL, -- 'linkedin', 'company', 'news', 'reputation'

  -- Cached data (JSONB for flexible structure)
  data JSONB NOT NULL,

  -- Expiration (30-day TTL)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS enrichment_cache_key_idx ON enrichment_cache(cache_key);
CREATE INDEX IF NOT EXISTS enrichment_cache_expires_idx ON enrichment_cache(expires_at);

-- No RLS needed - this is internal cache only accessed by server

-- ============================================
-- GOHIGHLEVEL INTEGRATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ghl_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- OAuth tokens (should be encrypted at application layer)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- GHL account info
  ghl_location_id TEXT NOT NULL,
  ghl_company_id TEXT,

  -- Settings
  auto_sync BOOLEAN DEFAULT true,
  sync_tags TEXT[], -- Tags to apply to synced contacts

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE ghl_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own GHL integration" ON ghl_integrations;

-- RLS Policy - Users can only manage their own GHL integration
CREATE POLICY "Users can manage their own GHL integration"
  ON ghl_integrations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR BUSINESS CARDS
-- ============================================

-- Note: Run this in Supabase Dashboard Storage section
-- or via SQL after enabling the storage extension

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-cards', 'business-cards', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own business cards" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own business cards" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own business cards" ON storage.objects;

-- RLS Policies for storage
CREATE POLICY "Users can upload their own business cards"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-cards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own business cards"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-cards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own business cards"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-cards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to clean up expired cache entries (run via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM enrichment_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update contact updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

-- Create trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_updated_at();

-- ============================================
-- SUBSCRIPTIONS TABLE (Stripe Integration)
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Subscription details
  status TEXT NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, trialing, inactive
  plan_name TEXT DEFAULT 'free', -- free, pro
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Trial info
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,

  -- Usage limits
  monthly_scan_limit INTEGER DEFAULT 5, -- 5 for free, 50 for pro
  scans_used_this_period INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;

-- RLS Policy - Users can only view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- USAGE TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Usage type
  action_type TEXT NOT NULL, -- 'scan', 'enrichment', 'export'

  -- Metadata
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_action_type_idx ON usage_logs(action_type);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage logs" ON usage_logs;

-- RLS Policy
CREATE POLICY "Users can view their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS FOR SUBSCRIPTIONS
-- ============================================

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Create trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to reset monthly scan count (run at start of billing period)
CREATE OR REPLACE FUNCTION reset_scan_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET scans_used_this_period = 0
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform a scan
CREATE OR REPLACE FUNCTION can_user_scan(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- If no subscription exists, they can't scan
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if within limit
  RETURN v_subscription.scans_used_this_period < v_subscription.monthly_scan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET scans_used_this_period = scans_used_this_period + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Stripe customer will be created on-demand when user first interacts with billing
  -- This just sets up the default free tier tracking with a unique placeholder ID
  INSERT INTO public.subscriptions (user_id, stripe_customer_id, plan_name, status, monthly_scan_limit)
  VALUES (NEW.id, 'pending_' || NEW.id::text, 'free', 'active', 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

-- Trigger to create default subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- ============================================
-- NOTES
-- ============================================

-- After running this schema:
-- 1. Verify all tables were created in Supabase Dashboard
-- 2. Check that storage bucket 'business-cards' exists
-- 3. Test RLS policies work correctly
-- 4. Set up scheduled job to run cleanup_expired_cache() daily
-- 5. Stripe webhooks will handle subscription updates automatically
