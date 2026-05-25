import type { APIRoute } from 'astro';

const getEnv = (key: string) => import.meta.env[key] || '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');


export const POST: APIRoute = async ({ request, locals }) => {
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '') || '';

  // Prefer authenticated middleware context; fallback to explicit bearer token.
  if (!locals.supabase && !authToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const rebuildUrl = `${supabaseUrl}/functions/v1/rebuild-site`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(rebuildUrl, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      let errorMessage = 'Rebuild failed';
      try {
        const data = await res.json();
        errorMessage = data?.error || errorMessage;
      } catch {
        // keep default message when response body is not JSON
      }

      return new Response(JSON.stringify({ error: errorMessage }), { status: res.status });
    }

    return new Response(JSON.stringify({ success: true, message: 'Deploy triggered. Commit pushed to GitHub.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
