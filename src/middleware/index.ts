import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => import.meta.env[key] || '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');
const adminAuthDisabledRaw = getEnv('ADMIN_AUTH_DISABLED') || getEnv('PUBLIC_ADMIN_AUTH_DISABLED');
const adminAuthDisabled = /^(1|true|yes|on)$/i.test(String(adminAuthDisabledRaw || '').trim());
const adminEnabledRaw =
  getEnv('NEXT_PUBLIC_ADMIN_ENABLED') ||
  getEnv('PUBLIC_ADMIN_ENABLED') ||
  getEnv('ADMIN_ENABLED');
// Default enabled unless explicitly set to a falsy value.
const adminEnabled =
  String(adminEnabledRaw || '').trim() === ''
    ? true
    : /^(1|true|yes|on)$/i.test(String(adminEnabledRaw).trim());


export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Only protect /admin routes (except /admin/login)
  const isAdmin = url.pathname.startsWith('/admin');
  const isAdmin404 = url.pathname === '/admin/404' || url.pathname === '/admin/404/';
  const isAdminLogin = url.pathname === '/admin/login' || url.pathname === '/admin/login/';
  const isAdminLoginApi = url.pathname === '/admin/api/login' || url.pathname === '/admin/api/login/';
  const isAdminApi = url.pathname.startsWith('/admin/api/');

  if (!isAdmin) {
    return await next();
  }

  // Feature-flag: when disabled, /admin should behave like it doesn't exist.
  if (!adminEnabled) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (isAdmin404) {
      return await next();
    }
    const res = await context.rewrite('/admin/404/');
    return new Response(res.body, {
      status: 404,
      headers: res.headers,
    });
  }

  if (isAdminLogin || isAdminLoginApi) {
    return await next();
  }

  // Check for auth token in cookies
  const authToken = cookies.get('sb-auth-token')?.value;

  if (adminAuthDisabled) {
    locals.user = { id: 'admin-anon', email: 'admin-anon' };
    locals.supabase = createClient(supabaseUrl, supabaseAnonKey);
    return await next();
  }

  if (!authToken) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    return redirect('/admin/login?error=session');
  }

  let user: any = null;
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const result = await supabase.auth.getUser(authToken);
    user = result.data?.user ?? null;
    if (result.error || !user) {
      cookies.delete('sb-auth-token', { path: '/' });
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return redirect('/admin/login/?error=session');
    }
  } catch {
    cookies.delete('sb-auth-token', { path: '/' });
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    return redirect('/admin/login?error=session');
  }

  locals.user = user;
  locals.supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  });

  try {
    const response = await next();
    if (response.status === 404 && isAdmin && !isAdmin404) {
      const res = await context.rewrite('/admin/404/');
      return new Response(res.body, {
        status: 404,
        headers: res.headers,
      });
    }
    return response;
  } catch (err) {
    // Don't log the user out on route errors; preserve auth cookie.
    console.error(err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
