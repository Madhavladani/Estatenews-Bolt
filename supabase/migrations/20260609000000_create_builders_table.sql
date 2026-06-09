/*
  # Create builders table

  1. New Tables
    - `builders`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `slug` (text, not null, unique)
      - `full_profile` (boolean, default false)
      - Profile fields
      - SEO fields
      - Timestamps

  2. Alterations
    - add `builder_id` to `projects`

  3. Security
    - Enable RLS on `builders` table
    - Add policy for anyone to read
*/

CREATE TABLE IF NOT EXISTS builders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  full_profile boolean DEFAULT false,
  
  -- Basic Info
  logo text DEFAULT '',
  cover_image text DEFAULT '',
  about_builder text DEFAULT '',
  year_established integer,
  headquarters text DEFAULT '',
  cities_served text[] DEFAULT '{}',
  
  -- Premium Info
  google_reviews_summary jsonb DEFAULT '{}',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  social_links jsonb DEFAULT '{}',
  whatsapp text DEFAULT '',
  founder_details text DEFAULT '',
  awards text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  press_coverage text[] DEFAULT '{}',
  testimonials jsonb DEFAULT '[]',
  
  -- SEO Info
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE builders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read builders"
  ON builders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_builders_slug ON builders(slug);

-- Add builder_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS builder_id uuid REFERENCES builders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_builder_id ON projects(builder_id);
