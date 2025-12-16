-- Migration: Add address column to contacts table
-- Run this in your Supabase SQL Editor

-- Add address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contacts' AND column_name = 'address'
    ) THEN
        ALTER TABLE contacts ADD COLUMN address TEXT;
        COMMENT ON COLUMN contacts.address IS 'Physical address extracted from business card OCR';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contacts' AND column_name = 'address';
