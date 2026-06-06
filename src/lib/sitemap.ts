import { toSiteUrl } from './site-url';

export function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function fullUrl(path: string) {
  return toSiteUrl(path);
}

export function formatLastmod(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function buildUrlset(
  entries: Array<{ loc: string; lastmod?: string }>
) {
  const urls = entries
    .map((entry) => {
      const lastmodTag = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
      return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastmodTag}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
