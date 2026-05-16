export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: cities } = await supabase.from('cities').select('id,slug,created_at');
  const cityById = new Map((cities || []).map((c) => [c.id, { slug: c.slug, created_at: c.created_at }]));

  const { data: localities } = await supabase.from('localities').select('city_id,slug,created_at');

  const entries = (localities || [])
    .filter((l) => cityById.has(l.city_id))
    .flatMap((l) => {
      const city = cityById.get(l.city_id)!;
      const lastmod = formatLastmod(l.created_at || city.created_at);
      return [
        { loc: fullUrl(`/${city.slug}/${l.slug}`), lastmod },
        { loc: fullUrl(`/${city.slug}/residential/${l.slug}`), lastmod },
        { loc: fullUrl(`/${city.slug}/commercial/${l.slug}`), lastmod },
      ];
    });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

