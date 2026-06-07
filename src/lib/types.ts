export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  hero_image: string;
  city_image: string;
  index_city: boolean;
  overview: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  last_modify: string;
}

export interface Project {
  id: string;
  city_id: string;
  locality_id?: string | null;
  project_type: 'residential' | 'commercial';
  title: string;
  slug: string;
  builder_name: string;
  builder_phone: string;
  location: string;
  address?: string;
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
  use_custom_faqs?: boolean;
  custom_faqs?: { question: string; answer: string }[] | any;
  meta_title: string;
  meta_description: string;
  published_at: string;
  created_at: string;
  last_modify: string;
  city?: City;
  locality?: Locality;
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
  canonical_url: string;
  created_at: string;
  last_modify: string;
  city?: City;
  projects?: Project[];
}

export interface Locality {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  seo_intro?: string;
  meta_title?: string;
  meta_description?: string;
  faqs?: { question: string; answer: string }[] | any;
  infrastructure?: any;
  created_at: string;
  last_modify: string;
  city?: City;
}

export interface Landmark {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  website?: string;
  contact_number?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: City;
  nearby_localities?: Locality[];
}

export interface LandmarkLocality {
  id: string;
  landmark_id: string;
  locality_id: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image: string;
  author_name: string;
  author_id: string | null;
  city_id: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string;
  updated_at: string;
  created_at: string;
  last_modify: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_path: string;
  og_image: string;
  noindex: boolean;
  city?: City;
  author?: Author;
  category: string;
  sub_category?: string;
  category_id?: string;
  sub_category_id?: string;
  faqs?: { question: string; answer: string }[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  sub_categories?: BlogSubCategory[];
}

export interface BlogSubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image_url: string;
  show_in_scroller?: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  category?: BlogCategory;
}

export interface Author {
  id: string;
  full_name: string;
  slug: string;
  photo_url: string;
  short_bio: string;
  experience: string;
  company_role: string;
  expertise_areas: string[];
  linkedin_profile: string;
  social_links: { platform: string; url: string }[];
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  city_id: string | null;
  question: string;
  answer: string;
  is_homepage: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: City;
}

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: City;
        Insert: Omit<City, 'id' | 'created_at' | 'last_modify'>;
        Update: Partial<Omit<City, 'id' | 'created_at' | 'last_modify'>>;
      };
      localities: {
        Row: Locality;
        Insert: Omit<Locality, 'id' | 'created_at' | 'last_modify'>;
        Update: Partial<Omit<Locality, 'id' | 'created_at' | 'last_modify'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'last_modify'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'last_modify'>>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, 'id' | 'created_at' | 'last_modify'>;
        Update: Partial<Omit<Collection, 'id' | 'created_at' | 'last_modify'>>;
      };
      landmarks: {
        Row: Landmark;
        Insert: Omit<Landmark, 'id' | 'created_at' | 'updated_at' | 'city' | 'nearby_localities'>;
        Update: Partial<Omit<Landmark, 'id' | 'created_at' | 'updated_at' | 'city' | 'nearby_localities'>>;
      };
      landmark_localities: {
        Row: LandmarkLocality;
        Insert: Omit<LandmarkLocality, 'id'>;
        Update: Partial<Omit<LandmarkLocality, 'id'>>;
      };
      news: {
        Row: Blog;
        Insert: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'last_modify'>;
        Update: Partial<Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'last_modify'>>;
      };
      faqs: {
        Row: Faq;
        Insert: Omit<Faq, 'id' | 'created_at' | 'updated_at' | 'city'>;
        Update: Partial<Omit<Faq, 'id' | 'created_at' | 'updated_at' | 'city'>>;
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
      news_collections: {
        Row: {
          id: string;
          news_id: string;
          collection_id: string;
          created_at: string;
        };
        Insert: {
          news_id: string;
          collection_id: string;
        };
        Update: Partial<{
          news_id: string;
          collection_id: string;
        }>;
      };
      authors: {
        Row: Author;
        Insert: Omit<Author, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Author, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
