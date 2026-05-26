/*
  # Add project custom FAQs

  1. Projects changes
    - Add `use_custom_faqs` (boolean)
    - Add `custom_faqs` (jsonb)
*/

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS use_custom_faqs boolean DEFAULT false;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS custom_faqs jsonb DEFAULT '[]'::jsonb;

