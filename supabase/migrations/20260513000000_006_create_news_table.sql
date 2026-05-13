/*
  # Create news table

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, not null, unique)
      - `excerpt` (text) - short summary
      - `content_html` (text) - article body (HTML)
      - `featured_image` (text) - card/hero image URL
      - `author_name` (text)
      - `city_id` (uuid, nullable, FK to cities) - optional city relevance
      - `tags` (text[]) - optional tags
      - `is_published` (boolean) - publish toggle
      - `published_at` (timestamptz) - publish date
      - `updated_at` (timestamptz) - last update timestamp
      - `created_at` (timestamptz) - creation timestamp
      - SEO fields:
        - `meta_title` (text)
        - `meta_description` (text)
        - `meta_keywords` (text)
        - `canonical_path` (text) - optional override like `/news/my-slug`
        - `og_image` (text) - optional override for social
        - `noindex` (boolean)

  2. Security
    - Enable RLS on `news`
    - Allow anyone to read published news
    - Allow authenticated users to manage news
*/

CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text DEFAULT '',
  content_html text DEFAULT '',
  featured_image text DEFAULT '',
  author_name text DEFAULT '',
  city_id uuid NULL REFERENCES cities(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  meta_keywords text DEFAULT '',
  canonical_path text DEFAULT '',
  og_image text DEFAULT '',
  noindex boolean NOT NULL DEFAULT false,
  UNIQUE(slug)
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published news"
  ON news FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_city_id ON news(city_id);

