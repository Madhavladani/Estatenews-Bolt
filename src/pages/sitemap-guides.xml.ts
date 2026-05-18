export const prerender = true;
import { buildUrlset, formatLastmod, fullUrl } from '../lib/sitemap';

const guidePaths = [
  '/buying-guide',
  '/buying-guide/how-to-buy-property',
  '/buying-guide/home-loan-guide',
  '/buying-guide/rera-guide',
  '/buying-guide/stamp-duty-guide',
  '/buying-guide/property-tax-guide',
  '/buying-guide/property-documents-checklist',
];

export async function GET() {
  const now = formatLastmod(new Date().toISOString());
  const entries = guidePaths.map((path) => ({
    loc: fullUrl(path),
    lastmod: now,
  }));

  return new Response(buildUrlset(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

