import { defineMiddleware } from 'astro:middleware';
import { applySecurityHeaders } from './lib/security';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  // Dev mode injects inline scripts for HMR, so the strict policy only applies to builds.
  if (!import.meta.env.DEV) applySecurityHeaders(response.headers);
  return response;
});
