export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';
import type { Blog } from '../lib/types';

export async function GET() {
  const { data } = await supabase
    .from('news')
    .select('slug,last_modify,published_at,updated_at,created_at,is_published')
    .eq('is_published', true);

  const articles = (data || []) as Blog[];

  const entries = articles.map((n) => ({
    loc: fullUrl(`/blog/${n.slug}`),
    lastmod: formatLastmod(n.last_modify || n.updated_at || n.published_at || n.created_at),
  }));

  // Include the blog index too (use latest article last_modify)
  entries.unshift({
    loc: fullUrl('/blog'),
    lastmod: formatLastmod(articles.reduce<string | null>((max, n) => {
      const v = (n.last_modify || n.updated_at || n.published_at || n.created_at) ?? null;
      if (!v) return max;
      if (!max) return v;
      return new Date(v).getTime() > new Date(max).getTime() ? v : max;
    }, null)),
  });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

