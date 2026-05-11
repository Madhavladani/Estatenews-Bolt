export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: collections } = await supabase
    .from('collections')
    .select('slug,created_at');

  const entries = [
    { loc: fullUrl('/collections') },
    ...(collections || []).map((collection) => ({
      loc: fullUrl(`/collections/${collection.slug}`),
      lastmod: formatLastmod(collection.created_at),
    })),
  ];

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
