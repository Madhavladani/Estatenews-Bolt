export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: collections } = await supabase
    .from('collections')
    .select('slug,last_modify,created_at');

  const entries = [
    {
      loc: fullUrl('/collections'),
      lastmod: formatLastmod((collections || []).reduce<string | null>((max, c) => {
        const v = (c.last_modify || c.created_at) ?? null;
        if (!v) return max;
        if (!max) return v;
        return new Date(v).getTime() > new Date(max).getTime() ? v : max;
      }, null)),
    },
    ...(collections || []).map((collection) => ({
      loc: fullUrl(`/collections/${collection.slug}`),
      lastmod: formatLastmod(collection.last_modify || collection.created_at),
    })),
  ];

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
