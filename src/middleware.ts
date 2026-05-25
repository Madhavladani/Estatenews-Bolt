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

  // Fallback for non-cacheable requests or non-Cloudflare environments
  if (!isCacheableMethod || isExcludedRoute || !cache) {
    return next();
  }

  // 6. Define cache key (URL must be absolute and unique)
  const cacheKey = new Request(url.toString(), context.request);

  // 11. Try to find the response in the edge cache
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    // 12. Clone cached response before modifying it
    const response = new Response(cachedResponse.body, cachedResponse);
    // 4. Add custom debug header for cache HIT
    response.headers.set('X-Cache', 'HIT');
    return response;
  }

  // 11. Cache MISS: Generate a fresh response
  const response = await next();

  // Only cache successful HTML responses to avoid caching error pages or assets
  const contentType = response.headers.get('content-type');
  if (response.status === 200 && contentType?.includes('text/html')) {
    // 12. Clone the response for cache storage
    const responseToCache = response.clone();

    // 5. Apply the required Cache-Control policy
    responseToCache.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

    // 7. Store the response in the edge cache asynchronously
    // @ts-ignore - runtime.ctx is provided by the @astrojs/cloudflare adapter
    const runtime = context.locals.runtime;
    if (runtime?.ctx?.waitUntil) {
      // 6. Use cache.put with a clone as required
      runtime.ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
    }
  }

  // 4 & 12. Return the fresh response with MISS header and cloning for safety
  const finalResponse = new Response(response.body, response);
  finalResponse.headers.set('X-Cache', 'MISS');
  
  return finalResponse;
});
