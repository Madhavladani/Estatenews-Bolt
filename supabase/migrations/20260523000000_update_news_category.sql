-- Add category column to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS category text DEFAULT 'Uncategorized';

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
