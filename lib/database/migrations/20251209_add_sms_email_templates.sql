-- Add SMS and Email template columns for follow-up messaging
-- These fields store AI-generated templates for quick outreach

-- SMS templates: short messages under 160 characters
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sms_templates JSONB DEFAULT '[]';

-- Email templates: with subject and body
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_templates JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN contacts.sms_templates IS 'Array of SMS message templates: [{message: string}]';
COMMENT ON COLUMN contacts.email_templates IS 'Array of email templates: [{subject: string, body: string}]';
