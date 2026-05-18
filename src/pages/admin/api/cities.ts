import type { APIRoute } from 'astro';

const INDEX_CITY_LIMIT = 12;

async function enforceIndexCityLimit(client: any, nextIndexCity: boolean | undefined, cityIdToExclude?: string) {
  if (!nextIndexCity) return null;

  let query = client
    .from('cities')
    .select('id', { count: 'exact', head: true })
    .eq('index_city', true);

  if (cityIdToExclude) query = query.neq('id', cityIdToExclude);

  const { count, error } = await query;
  if (error) return error.message;
  if ((count ?? 0) >= INDEX_CITY_LIMIT) return `Only ${INDEX_CITY_LIMIT} cities can be shown on the home page.`;
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const limitError = await enforceIndexCityLimit(client, body?.index_city);
  if (limitError) return new Response(JSON.stringify({ error: limitError }), { status: 400 });
  const { data, error } = await client.from('cities').insert(body).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const body = await request.json();
  const limitError = await enforceIndexCityLimit(client, body?.index_city, id);
  if (limitError) return new Response(JSON.stringify({ error: limitError }), { status: 400 });
  const { data, error } = await client.from('cities').update(body).eq('id', id).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  const client = locals.supabase;
  if (!client) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error } = await client.from('cities').delete().eq('id', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
