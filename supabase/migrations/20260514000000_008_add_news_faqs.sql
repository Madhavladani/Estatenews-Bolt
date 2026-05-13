-- Add FAQs column as JSONB to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
