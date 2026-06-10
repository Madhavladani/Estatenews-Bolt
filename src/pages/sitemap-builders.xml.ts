export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: citiesData } = await supabase.from('cities').select('id,slug');
  const cities = (citiesData || []) as any[];
  const cityById = new Map(cities.map((c) => [c.id, c.slug]));

  const { data: buildersData } = await supabase
    .from('builders')
    .select('slug,cities_served,updated_at,created_at');
  const builders = (buildersData || []) as any[];

  const cityLastmod = new Map<string, string>();
  const builderEntries: { loc: string; lastmod: string }[] = [];

  for (const builder of builders) {
    const rawDate = builder.updated_at || builder.created_at || new Date().toISOString();
    const lastmod = formatLastmod(rawDate) as string;
    
    if (Array.isArray(builder.cities_served)) {
      for (const cityId of builder.cities_served) {
        const citySlug = cityById.get(cityId);
        if (!citySlug) continue;

        // Track the most recent modification for the city's builders index
        const currentMax = cityLastmod.get(citySlug as string);
        if (!currentMax || new Date(lastmod) > new Date(currentMax)) {
          cityLastmod.set(citySlug as string, lastmod);
        }

        builderEntries.push({
          loc: fullUrl(`/${citySlug as string}/builders/${builder.slug}`),
          lastmod,
        });
      }
    }
  }

  const entries = [
    ...Array.from(cityLastmod.entries()).map(([citySlug, lastmod]) => ({
      loc: fullUrl(`/${citySlug}/builders`),
      lastmod,
    })),
    ...builderEntries,
  ];

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
