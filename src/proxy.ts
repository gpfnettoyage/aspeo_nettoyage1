import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import {
  ADMIN_BASE_PATH,
  COOKIE_PREFIX,
  isAdminPath,
  isAdminPublicPath,
  getSafeCallbackUrl,
} from '@/lib/constants/admin';
import { buildCsp } from '../csp.mjs';

// ============================================
// Security Headers
// Note: CSP is defined in next.config.mjs to include all analytics domains
// ============================================
const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Add HSTS in production only
if (process.env.NODE_ENV === 'production') {
  securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

// ============================================
// Next.js Proxy (formerly Middleware)
// Handles security headers and admin route protection at the edge
// Note: In Next.js 16+, "proxy" replaces "middleware" convention
// ============================================
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security: Validate pathname format
  if (!pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Add security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Anti-clickjacking : aucune page ne peut être affichée dans un cadre, sauf l'aperçu de
  // l'administration (cookie Draft Mode posé par /api/preview pour un administrateur connecté),
  // et uniquement par le site lui-même. Les brouillons restent soumis à la vérification de session.
  const previewFrame = !isAdminPath(pathname) && request.cookies.has('__prerender_bypass');
  response.headers.set('X-Frame-Options', previewFrame ? 'SAMEORIGIN' : 'DENY');
  response.headers.set('Content-Security-Policy', buildCsp({ allowSameOriginFrame: previewFrame }));

  // ============================================
  // Admin Route Protection (using BetterAuth cookie helper)
  // This is an OPTIMISTIC check - real authorization happens in server actions
  // ============================================
  if (isAdminPath(pathname) && !isAdminPublicPath(pathname)) {
    const sessionCookie = getSessionCookie(request, {
      cookiePrefix: COOKIE_PREFIX,
    });

    // Redirect to login if no valid session cookie
    if (!sessionCookie) {
      const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
      // Use safe callback URL to prevent open redirect and limit length
      loginUrl.searchParams.set('callbackUrl', getSafeCallbackUrl(pathname));
      return NextResponse.redirect(loginUrl);
    }
  }

  // NOTE: Login page redirect is handled server-side in login/layout.tsx
  // This allows proper session validation against the database
  // (proxy can only check cookie existence, not validity)

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
