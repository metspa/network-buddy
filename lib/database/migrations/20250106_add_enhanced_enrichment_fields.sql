-- Migration: Add Enhanced Enrichment Fields
-- Date: 2025-01-06
-- Description: Adds fields for multi-modal OCR, deep company research, and social media profiles
-- Part of: Enhanced Scanning & Enrichment System

-- ============================================
-- STEP 1: Add Image Classification Column
-- ============================================

-- Track what type of image was scanned
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS image_type TEXT;

COMMENT ON COLUMN contacts.image_type IS 'Type of scanned image: business_card, truck, storefront, ad, sign, other';

-- ============================================
-- STEP 2: Add Deep Company Data (from Perplexity AI)
-- ============================================

-- Company size and metrics
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_revenue TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_funding TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_founded INTEGER;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_employees TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_description TEXT;

-- People (founders and executives)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS founders TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS executives JSONB;

-- Competitive landscape
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS competitors TEXT[];

-- Technology stack
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS technologies TEXT[];

-- Job openings count
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS job_openings INTEGER;

-- Office locations
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS locations TEXT[];

-- External URLs
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS crunchbase_url TEXT;

-- ============================================
-- STEP 3: Add Social Media Profiles (from Serper/Perplexity)
-- ============================================

-- Social media URLs stored as JSONB
-- Structure: { twitter, instagram, facebook, tiktok, linkedin_company }
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_media JSONB;

COMMENT ON COLUMN contacts.social_media IS 'Social media profiles: { twitter, instagram, facebook, tiktok, linkedin_company }';

-- ============================================
-- STEP 4: Create Indexes for Performance
-- ============================================

-- Index for filtering by image type
CREATE INDEX IF NOT EXISTS contacts_image_type_idx ON contacts(image_type);

-- Index for company size queries
CREATE INDEX IF NOT EXISTS contacts_company_size_idx ON contacts(company_size);

-- Index for founded year queries
CREATE INDEX IF NOT EXISTS contacts_company_founded_idx ON contacts(company_founded);

-- Gin index for JSONB social_media (enables fast lookups)
CREATE INDEX IF NOT EXISTS contacts_social_media_gin_idx ON contacts USING GIN (social_media);

-- Gin index for executives JSONB
CREATE INDEX IF NOT EXISTS contacts_executives_gin_idx ON contacts USING GIN (executives);

-- ============================================
-- STEP 5: Update Cache Table for New Cache Types
-- ============================================

-- enrichment_cache table already supports 'perplexity' and 'social' via cache_type column
-- No schema changes needed, just note the new cache types:
-- - 'perplexity': Perplexity AI deep research data
-- - 'social': Social media profile URLs

COMMENT ON COLUMN enrichment_cache.cache_type IS 'Cache type: linkedin, company, news, reputation, perplexity, social';

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE contacts DROP COLUMN image_type;
-- ALTER TABLE contacts DROP COLUMN company_size;
-- ALTER TABLE contacts DROP COLUMN company_revenue;
-- ALTER TABLE contacts DROP COLUMN company_funding;
-- ALTER TABLE contacts DROP COLUMN company_founded;
-- ALTER TABLE contacts DROP COLUMN company_employees;
-- ALTER TABLE contacts DROP COLUMN company_description;
-- ALTER TABLE contacts DROP COLUMN founders;
-- ALTER TABLE contacts DROP COLUMN executives;
-- ALTER TABLE contacts DROP COLUMN competitors;
-- ALTER TABLE contacts DROP COLUMN social_media;
-- ALTER TABLE contacts DROP COLUMN technologies;
-- ALTER TABLE contacts DROP COLUMN job_openings;
-- ALTER TABLE contacts DROP COLUMN locations;
-- ALTER TABLE contacts DROP COLUMN crunchbase_url;
-- DROP INDEX IF EXISTS contacts_image_type_idx;
-- DROP INDEX IF EXISTS contacts_company_size_idx;
-- DROP INDEX IF EXISTS contacts_company_founded_idx;
-- DROP INDEX IF EXISTS contacts_social_media_gin_idx;
-- DROP INDEX IF EXISTS contacts_executives_gin_idx;
