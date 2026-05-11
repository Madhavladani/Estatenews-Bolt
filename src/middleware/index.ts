import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function shouldCompress(contentType: string | null, bodyLength: number) {
  if (!contentType) return false;
  if (bodyLength < 1024) return false;
  return /text\/html|application\/json|text\/css|application\/javascript|text\/plain/i.test(contentType);
}

async function compressResponse(response: Response, acceptEncoding: string | null): Promise<Response> {
  const contentType = response.headers.get('content-type');
  if (response.status !== 200) {
    return response;
  }

  const buf = await response.arrayBuffer();
  const input = Buffer.from(buf);
  if (!shouldCompress(contentType, input.byteLength)) {
    return new Response(input, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
  const headers = new Headers(response.headers);
  headers.set('Vary', 'Accept-Encoding');

  if (acceptEncoding?.includes('br')) {
    const output = brotliCompressSync(input, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 4,
      },
    });
    headers.set('Content-Encoding', 'br');
    headers.set('Content-Length', String(output.byteLength));
    return new Response(output, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (acceptEncoding?.includes('gzip')) {
    const output = gzipSync(input, { level: 6 });
    headers.set('Content-Encoding', 'gzip');
    headers.set('Content-Length', String(output.byteLength));
    return new Response(output, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(input, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals, request } = context;
  const acceptEncoding = context.isPrerendered ? null : request.headers.get('accept-encoding');

  // Only protect /admin routes (except /admin/login)
  const isAdmin = url.pathname.startsWith('/admin');
  const isAdminLogin = url.pathname === '/admin/login';
  const isAdminLoginApi = url.pathname === '/admin/api/login';

  if (!isAdmin) {
    const response = await next();
    return await compressResponse(response, acceptEncoding);
  }

  if (isAdminLogin || isAdminLoginApi) {
    const response = await next();
    return await compressResponse(response, acceptEncoding);
  }

  // Check for auth token in cookies
  const authToken = cookies.get('sb-auth-token')?.value;

  if (!authToken) {
    return redirect('/admin/login');
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(authToken);

    if (error || !user) {
      cookies.delete('sb-auth-token', { path: '/' });
      return redirect('/admin/login');
    }

    locals.user = user;
    locals.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    const response = await next();
    return await compressResponse(response, acceptEncoding);
  } catch {
    cookies.delete('sb-auth-token', { path: '/' });
    return redirect('/admin/login');
  }
});
