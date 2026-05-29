export const prerender = true;
import { supabase } from '../lib/supabase';
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

export async function GET() {
  const { data: cities } = await supabase.from('cities').select('id,slug');
  const cityById = new Map((cities || []).map((c) => [c.id, c.slug]));

  const { data: projects } = await supabase
    .from('projects')
    .select('city_id,project_type,slug,last_modify,published_at,created_at,locality_id,location');

  const cityIds = [...new Set((projects || []).map((p: any) => p.city_id).filter(Boolean))];
  const { data: localities } = cityIds.length
    ? await supabase.from('localities').select('id,slug,name,city_id').in('city_id', cityIds)
    : { data: [] as any[] };
  const localityById = new Map((localities || []).map((l: any) => [l.id, l]));
  const localityByCityAndName = new Map(
    (localities || []).map((l: any) => [`${l.city_id}::${l.name}`.toLowerCase(), l]),
  );

  const entries = (projects || [])
    .filter((project) => cityById.has(project.city_id))
    .map((project: any) => {
      const byId = project.locality_id ? localityById.get(project.locality_id) : undefined;
      const byName =
        !byId && project.location && project.city_id
          ? localityByCityAndName.get(`${project.city_id}::${project.location}`.toLowerCase())
          : undefined;
      const loc = byId || byName;
      return {
        loc: fullUrl(
          loc?.slug
            ? `/${cityById.get(project.city_id)}/${project.project_type}/${loc.slug}/${project.slug}`
            : `/${cityById.get(project.city_id)}/${project.project_type}/${project.slug}`,
        ),
      lastmod: formatLastmod(project.last_modify || project.published_at || project.created_at),
      };
    });

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
