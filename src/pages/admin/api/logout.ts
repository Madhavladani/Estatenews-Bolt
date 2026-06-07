import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ redirect, cookies }) => {
  cookies.delete('sb-auth-token', { path: '/' });
  return redirect('/admin/login/');
};
