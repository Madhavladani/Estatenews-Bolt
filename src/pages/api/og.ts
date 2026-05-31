export const prerender = false;

const SITE = 'Home Nesto';

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function GET({ url }: { url: URL }) {
  const title = (url.searchParams.get('title') || 'Real Estate Projects in Gujarat').slice(0, 90);
  const subtitle = (url.searchParams.get('subtitle') || 'Residential and Commercial Properties').slice(0, 100);

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1120" cy="80" r="220" fill="#22d3ee" fill-opacity="0.18" />
  <circle cx="120" cy="560" r="200" fill="#38bdf8" fill-opacity="0.12" />
  <text x="70" y="110" fill="#67e8f9" font-family="Arial, sans-serif" font-size="34" font-weight="700">${SITE}</text>
  <text x="70" y="270" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="700">${escapeHtml(title)}</text>
  <text x="70" y="340" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="34" font-weight="400">${escapeHtml(subtitle)}</text>
  <text x="70" y="560" fill="#bfdbfe" font-family="Arial, sans-serif" font-size="28">homenesto.com</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
