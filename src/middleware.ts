import { defineMiddleware, sequence } from 'astro:middleware';
import { onRequest as appMiddleware } from './middleware/index';

const LEGACY_HOSTNAME = 'estatenews-bolt.pages.dev';
const CANONICAL_ORIGIN = 'https://www.homenesto.com';

const redirectLegacyHost = defineMiddleware(async ({ url }, next) => {
  if (url.hostname !== LEGACY_HOSTNAME) {
    return next();
  }

  const destination = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
  return Response.redirect(destination.toString(), 301);
});

export const onRequest = sequence(redirectLegacyHost, appMiddleware);
