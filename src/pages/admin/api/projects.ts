import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const projects = Array.isArray(body) ? body : [body];

  const processedProjects = projects.map(project => {
    const p = { ...project };
    // Parse array fields
    if (typeof p.amenities === 'string') p.amenities = p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (typeof p.highlights === 'string') p.highlights = p.highlights.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (typeof p.gallery_images === 'string') p.gallery_images = p.gallery_images.split('\n').map((s: string) => s.trim()).filter(Boolean);
    if (typeof p.floor_plans === 'string') { try { p.floor_plans = JSON.parse(p.floor_plans); } catch { p.floor_plans = []; } }
    return p;
  });

  const { data, error } = await client.from('projects').insert(Array.isArray(body) ? processedProjects : processedProjects[0]).select();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(Array.isArray(body) ? data : data[0]), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const body = await request.json();
  if (typeof body.amenities === 'string') body.amenities = body.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  if (typeof body.highlights === 'string') body.highlights = body.highlights.split(',').map((s: string) => s.trim()).filter(Boolean);
  if (typeof body.gallery_images === 'string') body.gallery_images = body.gallery_images.split('\n').map((s: string) => s.trim()).filter(Boolean);
  if (typeof body.floor_plans === 'string') { try { body.floor_plans = JSON.parse(body.floor_plans); } catch { body.floor_plans = []; } }

  const { data, error } = await client.from('projects').update(body).eq('id', id).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error } = await client.from('projects').delete().eq('id', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
