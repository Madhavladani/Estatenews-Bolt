-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    short_bio TEXT,
    experience TEXT,
    company_role TEXT,
    expertise_areas TEXT[] DEFAULT '{}',
    linkedin_profile TEXT,
    social_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add author_id to news table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='author_id') THEN
        ALTER TABLE news ADD COLUMN author_id UUID REFERENCES authors(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Optional: Create a trigger to update updated_at on the authors table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_authors_updated_at') THEN
        CREATE TRIGGER update_authors_updated_at
        BEFORE UPDATE ON authors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
