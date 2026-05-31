export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin/api/

Sitemap: https://homenesto.com/sitemap-index.xml
Sitemap: https://homenesto.com/sitemap-cities.xml
Sitemap: https://homenesto.com/sitemap-projects.xml
Sitemap: https://homenesto.com/sitemap-collections.xml
Sitemap: https://homenesto.com/sitemap-blog.xml
Sitemap: https://homenesto.com/sitemap-guides.xml
Host: homenesto.com
`;
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
