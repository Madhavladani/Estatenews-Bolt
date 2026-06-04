CREATE TABLE landmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  image TEXT,
  description TEXT,
  website TEXT,
  contact_number TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(city_id, slug)
);

CREATE TABLE landmark_localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landmark_id UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
  locality_id UUID NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  UNIQUE(landmark_id, locality_id)
);

-- Enable RLS
ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE landmark_localities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Enable read access for all users on landmarks"
ON landmarks FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users on landmark_localities"
ON landmark_localities FOR SELECT USING (true);

-- Authenticated user access (admin)
CREATE POLICY "Enable all for authenticated users on landmarks" 
ON landmarks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users on landmark_localities" 
ON landmark_localities FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
