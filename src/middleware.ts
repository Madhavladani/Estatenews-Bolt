import { defineMiddleware } from 'astro:middleware';

/**
 * Cloudflare Edge HTML Caching Middleware for Astro SSR
 * 
 * Requirements implemented:
 * 1. Exclude /admin and /api
 * 2. Cache only GET requests
 * 3. Use Cloudflare Cache API (caches.default)
 * 4. X-Cache: HIT/MISS headers
 * 5. Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800
 * 6. cache.put(cacheKey, response.clone())
 * 7. context.locals.runtime.ctx.waitUntil for async storage
 * 8. Preserve Astro middleware structure
 * 9. Cloudflare Pages SSR compatibility
 * 10. No POST/PUT/DELETE caching
 * 11. Immediate return for HIT
 * 12. Clone before modifying headers
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const { pathname } = url;
  
  // 1 & 10. Filter: Only GET requests, excluding administrative and API paths
  const isCacheableMethod = context.request.method === 'GET';
  const isExcludedRoute = pathname.startsWith('/admin') || pathname.startsWith('/api');
  
  // 3 & 9. Access Cloudflare Cache API
  // @ts-ignore - caches is a global in Cloudflare Workers
  const cache = typeof caches !== 'undefined' ? caches.default : null;

  let response: Response;
  let cacheStatus: 'HIT' | 'MISS' | 'BYPASS' = 'BYPASS';

  // Define cache key (URL must be absolute and unique)
  const cacheKey = new Request(url.toString(), context.request);

  // Check if we should even try to look in the cache
  if (isCacheableMethod && !isExcludedRoute && cache) {
    // Try to find the response in the edge cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      response = new Response(cachedResponse.body, cachedResponse);
      cacheStatus = 'HIT';
    } else {
      response = await next();
      cacheStatus = 'MISS';
    }
  } else {
    response = await next();
    cacheStatus = 'BYPASS';
  }

  // Security Headers and Cache Storage Logic for Fresh Responses
  if (cacheStatus === 'MISS') {
    const contentType = response.headers.get('content-type');
    // Only cache successful HTML responses
    if (response.status === 200 && contentType?.includes('text/html')) {
      const responseToCache = response.clone();
      
      // Apply Cache-Control policy for Edge Caching
      responseToCache.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

      // Store in edge cache asynchronously
      // @ts-ignore - runtime.ctx is provided by the @astrojs/cloudflare adapter
      const runtime = context.locals.runtime;
      if (runtime?.ctx?.waitUntil) {
        runtime.ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
      }
    }
  }

  // Final Response Modification: Add Security Headers to ALL responses
  const finalResponse = new Response(response.body, response);
  
  // Custom Cache Debug Header
  if (cacheStatus !== 'BYPASS') {
    finalResponse.headers.set('X-Cache', cacheStatus);
  }

  // Security Headers
  finalResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  finalResponse.headers.set('X-Frame-Options', 'DENY');
  finalResponse.headers.set('X-Content-Type-Options', 'nosniff');
  finalResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  finalResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://upjwyiotetlxctxklyzk.supabase.co https://pub-b00078500b644b16838e64dd1c00b7c9.r2.dev; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://upjwyiotetlxctxklyzk.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );

  // Ensure proper content-type header is preserved (it should be already, but being explicit)
  if (response.headers.has('content-type')) {
    finalResponse.headers.set('content-type', response.headers.get('content-type')!);
  }

  return finalResponse;
});
