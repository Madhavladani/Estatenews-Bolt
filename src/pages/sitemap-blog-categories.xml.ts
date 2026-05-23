export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: categories } = await supabase.from('blog_categories').select('slug, updated_at, created_at');
  const { data: subCategories } = await supabase.from('blog_sub_categories').select('slug, updated_at, created_at');

  const entries: any[] = [];

  (categories || []).forEach(c => {
    entries.push({
      loc: fullUrl(`/blog/category/${c.slug}`),
      lastmod: formatLastmod(c.updated_at || c.created_at)
    });
  });

  (subCategories || []).forEach(s => {
    entries.push({
      loc: fullUrl(`/blog/subcategory/${s.slug}`),
      lastmod: formatLastmod(s.updated_at || s.created_at)
    });
  });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
