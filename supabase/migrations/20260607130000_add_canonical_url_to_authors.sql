-- Add canonical_url column to authors table if it doesn't already exist
ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS canonical_url text DEFAULT '';
