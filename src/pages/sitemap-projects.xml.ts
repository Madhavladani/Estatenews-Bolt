export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: cities } = await supabase.from('cities').select('id,slug');
  const cityById = new Map((cities || []).map((c) => [c.id, c.slug]));

  const { data: projects } = await supabase
    .from('projects')
    .select('city_id,project_type,slug,last_modify,published_at,created_at');

  const entries = (projects || [])
    .filter((project) => cityById.has(project.city_id))
    .map((project) => ({
      loc: fullUrl(`/${cityById.get(project.city_id)}/${project.project_type}/${project.slug}`),
      lastmod: formatLastmod(project.last_modify || project.published_at || project.created_at),
    }));

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
