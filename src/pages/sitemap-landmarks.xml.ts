export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: cities } = await supabase.from('cities').select('id,slug,last_modify,created_at');
  const cityById = new Map((cities || []).map((c: any) => [c.id, { slug: c.slug, last_modify: c.last_modify, created_at: c.created_at }]));

  const { data: landmarks } = await supabase.from('landmarks').select('city_id,slug,updated_at,created_at,is_active').eq('is_active', true);

  const entries = (landmarks || [])
    .filter((l: any) => cityById.has(l.city_id))
    .map((l: any) => {
      const city = cityById.get(l.city_id) as any;
      const lastmod = formatLastmod(l.updated_at || l.created_at || city.last_modify || city.created_at);
      return { loc: fullUrl(`/${city.slug}/${l.slug}`), lastmod };
    });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
