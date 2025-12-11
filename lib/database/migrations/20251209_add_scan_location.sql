-- Add scan location fields to contacts table
-- These store the GPS coordinates captured when scanning a business card
-- Useful for identifying specific locations of chain businesses

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_latitude DECIMAL(10, 8);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_longitude DECIMAL(11, 8);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scan_location_accuracy DECIMAL(10, 2);
