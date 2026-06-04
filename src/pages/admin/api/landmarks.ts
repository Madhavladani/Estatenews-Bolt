import type { APIRoute } from 'astro';

function pickDefined<T>(obj: Record<string, any>): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) (out as any)[k] = v;
  }
  return out;
}

export const GET: APIRoute = async ({ url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const cityId = url.searchParams.get('city_id');

  let query = client
    .from('landmarks')
    .select('*, city:cities(name, slug), landmark_localities(locality_id)')
    .order('name');
    
  if (cityId) query = query.eq('city_id', cityId);

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { locality_ids, ...rest } = body;
  
  const payload = { ...pickDefined(rest), updated_at: new Date().toISOString() };
  const { data, error } = await client.from('landmarks').insert(payload).select().single();
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  if (locality_ids && Array.isArray(locality_ids) && locality_ids.length > 0) {
    const ll = locality_ids.map((id) => ({ landmark_id: data.id, locality_id: id }));
    await client.from('landmark_localities').insert(ll);
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const body = await request.json();
  const { locality_ids, ...rest } = body;
  
  const payload = { ...pickDefined(rest), updated_at: new Date().toISOString() };
  const { data, error } = await client.from('landmarks').update(payload).eq('id', id).select().single();
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  if (locality_ids && Array.isArray(locality_ids)) {
    // Delete existing relations
    await client.from('landmark_localities').delete().eq('landmark_id', id);
    // Insert new relations
    if (locality_ids.length > 0) {
      const ll = locality_ids.map((locId) => ({ landmark_id: id, locality_id: locId }));
      await client.from('landmark_localities').insert(ll);
    }
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error } = await client.from('landmarks').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
