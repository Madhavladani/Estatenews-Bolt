/*
  # Add last_modify columns

  Adds `last_modify` (timestamptz) to:
    - cities
    - collections
    - localities
    - projects
    - news

  This field is intended to be updated only when content is added/edited from the admin side
  (application code sets it on insert/update). It is used for sitemap <lastmod>.
*/

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS last_modify timestamptz NOT NULL DEFAULT now();

ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS last_modify timestamptz NOT NULL DEFAULT now();

ALTER TABLE localities
  ADD COLUMN IF NOT EXISTS last_modify timestamptz NOT NULL DEFAULT now();

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS last_modify timestamptz NOT NULL DEFAULT now();

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS last_modify timestamptz NOT NULL DEFAULT now();

-- Backfill to something meaningful for existing rows
UPDATE cities SET last_modify = COALESCE(last_modify, created_at, now()) WHERE last_modify IS NULL;
UPDATE collections SET last_modify = COALESCE(last_modify, created_at, now()) WHERE last_modify IS NULL;
UPDATE localities SET last_modify = COALESCE(last_modify, created_at, now()) WHERE last_modify IS NULL;
UPDATE projects SET last_modify = COALESCE(last_modify, published_at, created_at, now()) WHERE last_modify IS NULL;
UPDATE news SET last_modify = COALESCE(last_modify, updated_at, published_at, created_at, now()) WHERE last_modify IS NULL;

