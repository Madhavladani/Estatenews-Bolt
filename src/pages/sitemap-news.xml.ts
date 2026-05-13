export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data } = await supabase
    .from('news')
    .select('slug,published_at,updated_at,created_at,is_published')
    .eq('is_published', true);

  const entries = (data || []).map((n) => ({
    loc: fullUrl(`/news/${n.slug}`),
    lastmod: formatLastmod(n.updated_at || n.published_at || n.created_at),
  }));

  // Include the news index too
  entries.unshift({
    loc: fullUrl('/news'),
    lastmod: formatLastmod(new Date().toISOString()),
  });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

