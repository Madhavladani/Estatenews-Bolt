/*
  # Add canonical_url to collections

  Adds an optional canonical URL field for collection pages so SEO canonicals
  can be overridden from the admin panel when needed.
*/

ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS canonical_url text NOT NULL DEFAULT '';
