/*
  # Add localities + project address

  1. New Tables
    - `localities`
      - `id` (uuid, primary key)
      - `city_id` (uuid, FK to cities)
      - `name` (text, not null)
      - `slug` (text, not null)
      - `created_at` (timestamptz)

  2. Projects changes
    - Add `locality_id` (uuid, FK to localities)
    - Add `address` (text)

  3. Security
    - Enable RLS on `localities`
    - Add SELECT policy for anon/authenticated
    - Add CRUD policies for authenticated
*/

CREATE TABLE IF NOT EXISTS localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  seo_intro text DEFAULT '',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  faqs jsonb DEFAULT '[]'::jsonb,
  infrastructure jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_localities_city_id ON localities(city_id);
CREATE INDEX IF NOT EXISTS idx_localities_slug ON localities(slug);

ALTER TABLE localities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read localities"
  ON localities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert localities"
  ON localities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update localities"
  ON localities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete localities"
  ON localities FOR DELETE
  TO authenticated
  USING (true);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS locality_id uuid REFERENCES localities(id) ON DELETE SET NULL;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS address text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_projects_locality_id ON projects(locality_id);

-- Backfill for existing installations (idempotent when re-run)
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

