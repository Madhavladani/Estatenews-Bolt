/*
  # Create cities table

  1. New Tables
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text, not null) - City name
      - `slug` (text, unique, not null) - URL slug
      - `state` (text, not null) - State name
      - `hero_image` (text) - Hero image URL
      - `city_image` (text) - Listing/card image URL
      - `index_city` (boolean) - Show on homepage (max 12)
      - `overview` (text) - City overview content
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `cities` table
    - Add policy for authenticated users to read cities
    - Add policy for anonymous users to read cities (public data for static generation)
*/

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  state text NOT NULL DEFAULT 'Gujarat',
  hero_image text DEFAULT '',
  city_image text DEFAULT '',
  index_city boolean NOT NULL DEFAULT false,
  overview text DEFAULT '',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cities"
  ON cities FOR SELECT
  TO anon, authenticated
  USING (true);
