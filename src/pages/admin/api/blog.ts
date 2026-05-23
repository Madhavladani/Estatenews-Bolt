import type { APIRoute } from 'astro';
import { supabase as client } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((s: string) => s.trim()).filter(Boolean);

  const now = new Date().toISOString();
  const payload = { ...body, last_modify: now, updated_at: now };
  const { data, error: insertError } = await client.from('news').insert(payload).select().single() as any;
  
  if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 400 });

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url }) => {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const body = await request.json();

  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((s: string) => s.trim()).filter(Boolean);

  const now = new Date().toISOString();
  body.updated_at = now;
  body.last_modify = now;

  const { data, error: updateError } = await client.from('news').update(body).eq('id', id).select().single() as any;
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error: deleteError } = await client.from('news').delete().eq('id', id);
  if (deleteError) return new Response(JSON.stringify({ error: deleteError.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
