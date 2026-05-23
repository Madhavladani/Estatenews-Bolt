-- Add sub_category column to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS sub_category text;

-- Add index for sub_category
CREATE INDEX IF NOT EXISTS idx_news_sub_category ON news(sub_category);
