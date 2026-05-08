import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Only protect /admin routes (except /admin/login)
  const isAdmin = url.pathname.startsWith('/admin');
  const isAdminLogin = url.pathname === '/admin/login';
  const isAdminLoginApi = url.pathname === '/admin/api/login';

  if (!isAdmin) {
    return next();
  }

  if (isAdminLogin || isAdminLoginApi) {
    return next();
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

    return next();
  } catch {
    cookies.delete('sb-auth-token', { path: '/' });
    return redirect('/admin/login');
  }
});
