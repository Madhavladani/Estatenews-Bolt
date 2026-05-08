export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: https://propdiscover.com/sitemap-index.xml
`;
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
