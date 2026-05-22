export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';
import type { Author } from '../lib/types';

export async function GET() {
  const { data } = await supabase
    .from('authors' as any)
    .select('slug, updated_at, created_at');

  const authors = (data || []) as Author[];

  const entries = authors.map((a) => ({
    loc: fullUrl(`/author/${a.slug}`),
    lastmod: formatLastmod(a.updated_at || a.created_at),
  }));

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
