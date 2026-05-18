/*
  # Create faqs table

  1. New Tables
    - `faqs`
      - `id` (uuid, primary key)
      - `city_id` (uuid, nullable) - City-wise FAQ when set, general FAQ when null
      - `question` (text, not null)
      - `answer` (text, not null)
      - `is_homepage` (boolean) - Show on homepage FAQ section
      - `sort_order` (int) - Manual ordering
      - `is_active` (boolean) - Enable/disable display
      - `created_at` / `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `faqs` table
    - Allow anyone (anon/auth) to read active FAQs
    - Allow authenticated users to insert/update/delete FAQs
*/

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NULL REFERENCES cities(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text NOT NULL,
  is_homepage boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_city_id_idx ON faqs(city_id);
CREATE INDEX IF NOT EXISTS faqs_is_homepage_idx ON faqs(is_homepage);
CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON faqs(is_active);
CREATE INDEX IF NOT EXISTS faqs_sort_order_idx ON faqs(sort_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active faqs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated can insert faqs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update faqs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete faqs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION set_faqs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_faqs_updated_at ON faqs;
CREATE TRIGGER trg_set_faqs_updated_at
BEFORE UPDATE ON faqs
FOR EACH ROW
EXECUTE FUNCTION set_faqs_updated_at();

