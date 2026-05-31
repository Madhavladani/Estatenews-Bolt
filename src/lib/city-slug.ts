import { staticCities } from './static-cities';
import type { City } from './types';

const CITY_SLUG_ALIASES: Record<string, string> = {
  // Common misspelling seen in inbound URLs
  ahmedbad: 'ahmedabad',
};

export function normalizeCitySlug(raw: string | undefined | null): { slug: string; redirectedFrom?: string } {
  const input = String(raw || '').trim();
  const lower = input.toLowerCase();
  const normalized = CITY_SLUG_ALIASES[lower] ?? lower;
  return normalized !== input ? { slug: normalized, redirectedFrom: input } : { slug: normalized };
}

export function fallbackCityFromStatic(slug: string): City | null {
  const found = staticCities.find((c) => c.slug === slug);
  if (!found) return null;

  const now = new Date().toISOString();
  return {
    id: `static:${found.slug}`,
    name: found.name,
    slug: found.slug,
    state: found.state,
    hero_image: '',
    city_image: '',
    index_city: true,
    overview: found.shortDescription,
    meta_title: `${found.name} Real Estate | Top Residential & Commercial Projects`,
    meta_description: `Discover the best residential and commercial real estate projects in ${found.name}, ${found.state}. Explore new launches, luxury apartments, villas, and office spaces.`,
    created_at: now,
    last_modify: now,
  };
}

