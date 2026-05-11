export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: cities } = await supabase.from('cities').select('slug,created_at');

  const entries = (cities || []).flatMap((city) => [
    {
      loc: fullUrl(`/${city.slug}`),
      lastmod: formatLastmod(city.created_at),
    },
    {
      loc: fullUrl(`/${city.slug}/residential`),
      lastmod: formatLastmod(city.created_at),
    },
    {
      loc: fullUrl(`/${city.slug}/commercial`),
      lastmod: formatLastmod(city.created_at),
    },
  ]);

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
