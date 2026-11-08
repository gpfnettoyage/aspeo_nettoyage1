/* global process */
/**
 * Content-Security-Policy du site (source unique, utilisée par next.config.mjs et src/proxy.ts).
 * - frame-ancestors : « none » partout ; « self » uniquement pour l'aperçu de l'administration.
 * - upgrade-insecure-requests : production uniquement (le développement local est en http).
 */
const BASE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://c.bing.com https://va.vercel-scripts.com https://static.hotjar.com https://script.hotjar.com https://vercel.live https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://www.googletagmanager.com https://*.public.blob.vercel-storage.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://c.bing.com https://vitals.vercel-insights.com https://in.hotjar.com https://insights.hotjar.com https://api.hotjar.com wss://ws.hotjar.com https://content.hotjar.io https://metrics.hotjar.io https://vercel.live https://challenges.cloudflare.com",
  "frame-src 'self' https://vercel.live https://challenges.cloudflare.com",
];

/** @param {{ allowSameOriginFrame?: boolean }} [opts] */
export function buildCsp(opts = {}) {
  return [
    ...BASE,
    `frame-ancestors ${opts.allowSameOriginFrame ? "'self'" : "'none'"}`,
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}
