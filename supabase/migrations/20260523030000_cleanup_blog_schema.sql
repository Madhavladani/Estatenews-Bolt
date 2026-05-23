-- Cleanup legacy columns from news table
ALTER TABLE news DROP COLUMN IF EXISTS category;
ALTER TABLE news DROP COLUMN IF EXISTS sub_category;

-- Remove unused property-style collection join table
DROP TABLE IF EXISTS news_collections;

-- Update types if necessary (already did in types.ts previously)
