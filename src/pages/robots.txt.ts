export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin/api/

Sitemap: https://propdiscover.com/sitemap-index.xml
Sitemap: https://propdiscover.com/sitemap-cities.xml
Sitemap: https://propdiscover.com/sitemap-projects.xml
Sitemap: https://propdiscover.com/sitemap-collections.xml
Sitemap: https://propdiscover.com/sitemap-news.xml
Sitemap: https://propdiscover.com/sitemap-guides.xml
Host: propdiscover.com
`;
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
