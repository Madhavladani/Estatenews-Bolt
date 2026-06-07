export const SITE_URL = 'https://homenesto.com';

export function normalizeSitePath(path: string) {
  if (!path || path === '/') return '/';

  let normalized = path.startsWith('/') ? path : `/${path}`;

  // Ensure trailing slash if it's not a file (doesn't have an extension)
  const hasExtension = /\.[a-z0-9]+$/i.test(normalized);
  if (!hasExtension && !normalized.endsWith('/')) {
    normalized += '/';
  }

  return normalized;
}

export function toSiteUrl(path: string) {
  return new URL(normalizeSitePath(path), SITE_URL).href;
}

export function normalizeSiteUrl(url: string) {
  const parsed = new URL(url, SITE_URL);

  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const isProd = parsed.origin === SITE_URL;

  if (isProd || isLocal) {
    parsed.pathname = normalizeSitePath(parsed.pathname);
  }

  return parsed.href;
}
