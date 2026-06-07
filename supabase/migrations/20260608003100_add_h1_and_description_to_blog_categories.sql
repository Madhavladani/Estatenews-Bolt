-- Add H1 and Description to blog_categories and blog_sub_categories
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS h1_title TEXT;
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE blog_sub_categories ADD COLUMN IF NOT EXISTS h1_title TEXT;
ALTER TABLE blog_sub_categories ADD COLUMN IF NOT EXISTS description TEXT;
