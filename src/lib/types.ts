export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  hero_image: string;
  overview: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export interface Project {
  id: string;
  city_id: string;
  project_type: 'residential' | 'commercial';
  title: string;
  slug: string;
  builder_name: string;
  builder_phone: string;
  location: string;
  short_description: string;
  full_description: string;
  featured_image: string;
  gallery_images: string[];
  amenities: string[];
  highlights: string[];
  price_range: string;
  possession_date: string;
  project_status: 'new-launch' | 'under-construction' | 'ready-to-move';
  floor_plans: FloorPlan[];
  brochure_url: string;
  rera_number: string;
  latitude: number;
  longitude: number;
  meta_title: string;
  meta_description: string;
  published_at: string;
  created_at: string;
  city?: City;
}

export interface FloorPlan {
  name: string;
  size: string;
  price: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  city_id: string | null;
  collection_type: string;
  intro_content: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  city?: City;
  projects?: Project[];
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image: string;
  author_name: string;
  city_id: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string;
  updated_at: string;
  created_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_path: string;
  og_image: string;
  noindex: boolean;
  city?: City;
}

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: City;
        Insert: Omit<City, 'id' | 'created_at'>;
        Update: Partial<Omit<City, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, 'id' | 'created_at'>;
        Update: Partial<Omit<Collection, 'id' | 'created_at'>>;
      };
      news: {
        Row: News;
        Insert: Omit<News, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<News, 'id' | 'created_at' | 'updated_at'>>;
      };
      collection_projects: {
        Row: {
          id: string;
          collection_id: string;
          project_id: string;
        };
        Insert: {
          collection_id: string;
          project_id: string;
        };
        Update: Partial<{
          collection_id: string;
          project_id: string;
        }>;
      };
    };
  };
}
