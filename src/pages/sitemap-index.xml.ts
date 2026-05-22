export const prerender = true;

const SITE_URL = 'https://propdiscover.com';
const paths = [
  '/sitemap-cities.xml',
  '/sitemap-projects.xml',
  '/sitemap-collections.xml',
  '/sitemap-blog.xml',
  '/sitemap-authors.xml',
  '/sitemap-localities.xml',
  '/sitemap-guides.xml',
];

export async function GET() {
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `<sitemap><loc>${new URL(path, SITE_URL).href}</loc><lastmod>${now}</lastmod></sitemap>`
  )
  .join('')}
</sitemapindex>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
