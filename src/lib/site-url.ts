export const SITE_URL = 'https://homenesto.com';

export function normalizeSitePath(path: string) {
  if (!path || path === '/') return '/';

  return path.startsWith('/') ? path : `/${path}`;
}

export function toSiteUrl(path: string) {
  return new URL(normalizeSitePath(path), SITE_URL).href;
}

export function normalizeSiteUrl(url: string) {
  const parsed = new URL(url, SITE_URL);

  if (parsed.origin !== SITE_URL) {
    return parsed.href;
  }

  parsed.pathname = normalizeSitePath(parsed.pathname);
  return parsed.href;
}
