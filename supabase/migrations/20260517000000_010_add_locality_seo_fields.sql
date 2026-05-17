/*
  # Add locality SEO + intelligence fields

  NOTE: This is a follow-up migration. If your database was already migrated with
  `20260516000000_009_add_localities_and_project_address.sql`, you still need
  this file to add the new columns.
*/

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS seo_intro text DEFAULT '';

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS meta_title text DEFAULT '';

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS meta_description text DEFAULT '';

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS infrastructure jsonb DEFAULT '{}'::jsonb;

