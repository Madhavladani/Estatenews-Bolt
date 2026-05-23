-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_sub_categories table
CREATE TABLE IF NOT EXISTS blog_sub_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key columns to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;
ALTER TABLE news ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES blog_sub_categories(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_sub_category_id ON news(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_blog_sub_categories_category_id ON blog_sub_categories(category_id);

-- Enable RLS (assuming other tables have it)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_sub_categories ENABLE ROW LEVEL SECURITY;

-- Add policies for public read access
CREATE POLICY "Allow public read access on blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on blog_sub_categories" ON blog_sub_categories FOR SELECT USING (true);

-- Add policies for admin service access (matching existing pattern)
CREATE POLICY "Allow all access on blog_categories for authenticated" ON blog_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on blog_sub_categories for authenticated" ON blog_sub_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
