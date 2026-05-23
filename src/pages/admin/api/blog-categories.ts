import type { APIRoute } from 'astro';
import { supabase as client } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { data, error } = await client.from('blog_categories').insert(body).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url }) => {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  const body = await request.json();
  const { data, error } = await client.from('blog_categories').update(body).eq('id', id).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  const { error } = await client.from('blog_categories').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
