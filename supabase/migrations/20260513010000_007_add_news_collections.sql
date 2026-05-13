/*
  # Add news_collections join table

  Links news articles to relevant collections (many-to-many).
  Used to power the "Suggested Collections" section on individual news article pages.

  1. New Tables
    - `news_collections`
      - `id` (uuid, primary key)
      - `news_id` (uuid, FK to news)
      - `collection_id` (uuid, FK to collections)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anon/authenticated can read
    - Authenticated can insert/update/delete
*/

CREATE TABLE IF NOT EXISTS news_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(news_id, collection_id)
);

ALTER TABLE news_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news_collections"
  ON news_collections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert news_collections"
  ON news_collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete news_collections"
  ON news_collections FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_news_collections_news_id ON news_collections(news_id);
CREATE INDEX IF NOT EXISTS idx_news_collections_collection_id ON news_collections(collection_id);
