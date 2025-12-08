-- Migration: Add GMB Reviews and Photos
-- Date: 2025-01-06
-- Description: Adds fields for Google My Business detailed reviews and photos from SerpApi
-- Part of: Prioritized GMB Enrichment

-- ============================================
-- STEP 1: Add GMB Review Fields
-- ============================================

-- Store up to 10 most recent detailed reviews as JSONB
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_reviews JSONB;

COMMENT ON COLUMN contacts.gmb_reviews IS 'Detailed GMB reviews: [{ author, rating, text, date, likes }]';

-- ============================================
-- STEP 2: Add GMB Photo Fields
-- ============================================

-- Store up to 20 business photos as JSONB
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_photos JSONB;

COMMENT ON COLUMN contacts.gmb_photos IS 'GMB business photos: [{ url, thumbnail, title? }]';

-- ============================================
-- STEP 3: Add Additional GMB Fields
-- ============================================

-- Place ID for reference
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_place_id TEXT;

-- Business hours (e.g., "Open now · Closes 6 PM")
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gmb_hours TEXT;

-- ============================================
-- STEP 4: Create Indexes for Performance
-- ============================================

-- Gin index for JSONB reviews (enables fast lookups on review content)
CREATE INDEX IF NOT EXISTS contacts_gmb_reviews_gin_idx ON contacts USING GIN (gmb_reviews);

-- Gin index for JSONB photos
CREATE INDEX IF NOT EXISTS contacts_gmb_photos_gin_idx ON contacts USING GIN (gmb_photos);

-- Index for place ID lookups
CREATE INDEX IF NOT EXISTS contacts_gmb_place_id_idx ON contacts(gmb_place_id);

-- ============================================
-- STEP 5: Update Cache Table Comments
-- ============================================

-- Add 'gmb' to supported cache types
COMMENT ON COLUMN enrichment_cache.cache_type IS 'Cache type: linkedin, company, news, reputation, perplexity, social, gmb';

-- ============================================
-- NOTES FOR ROLLBACK
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE contacts DROP COLUMN gmb_reviews;
-- ALTER TABLE contacts DROP COLUMN gmb_photos;
-- ALTER TABLE contacts DROP COLUMN gmb_place_id;
-- ALTER TABLE contacts DROP COLUMN gmb_hours;
-- DROP INDEX IF EXISTS contacts_gmb_reviews_gin_idx;
-- DROP INDEX IF EXISTS contacts_gmb_photos_gin_idx;
-- DROP INDEX IF EXISTS contacts_gmb_place_id_idx;
