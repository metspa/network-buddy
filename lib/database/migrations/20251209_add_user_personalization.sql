-- Add personalization fields to profiles table for AI message customization
-- These fields help generate personalized SMS/email templates

-- User's preferred nickname (how AI addresses them)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);

-- User's occupation/role (e.g., "Real Estate Agent", "Marketing Director")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation VARCHAR(200);

-- More context about the user (interests, values, communication style)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me TEXT;

-- User's company name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);

-- User's industry
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

-- Preferred communication tone (professional, casual, friendly)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_tone VARCHAR(50) DEFAULT 'professional';

-- Add comments for documentation
COMMENT ON COLUMN profiles.nickname IS 'User preferred nickname for AI to use';
COMMENT ON COLUMN profiles.occupation IS 'User job title/occupation for context';
COMMENT ON COLUMN profiles.about_me IS 'User bio, interests, and preferences';
COMMENT ON COLUMN profiles.company_name IS 'User company name';
COMMENT ON COLUMN profiles.industry IS 'User industry/sector';
COMMENT ON COLUMN profiles.communication_tone IS 'Preferred tone: professional, casual, friendly';
