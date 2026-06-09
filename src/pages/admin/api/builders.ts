import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const client = locals.supabase;
  if (!client) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = { ...body, updated_at: new Date().toISOString() };

    const { data, error } = await client
      .from('builders')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const client = locals.supabase;
  if (!client) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const payload = { ...body, updated_at: new Date().toISOString() };

    const { data, error } = await client
      .from('builders')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  const client = locals.supabase;
  if (!client) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  try {
    const { error } = await client
      .from('builders')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 });
  }
};
