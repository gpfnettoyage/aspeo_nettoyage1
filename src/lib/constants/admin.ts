/**
 * Admin Panel Constants
 * Centralized configuration for admin routes and authentication
 * Values are sourced from src/data/company.json
 */

import companyData from '@/data/company.json';

// ============================================
// Admin Configuration from company.json
// ============================================

const adminConfig = companyData.admin;

/**
 * Base path for admin panel (security through obscurity layer)
 * Real security is enforced by authentication checks
 */
export const ADMIN_BASE_PATH = adminConfig.basePath;

/**
 * Cookie prefix used by BetterAuth
 * Must match the value in src/lib/auth.ts
 */
export const COOKIE_PREFIX = adminConfig.cookiePrefix;

/**
 * Maximum length for callback URLs to prevent abuse
 */
export const MAX_CALLBACK_URL_LENGTH = adminConfig.maxCallbackUrlLength;

/**
 * Admin paths that should be accessible without authentication
 * Used by proxy for optimistic checks and server actions for validation
 */
export const ADMIN_PUBLIC_PATHS = adminConfig.publicPaths as readonly string[];

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a pathname is a public admin path (no auth required)
 */
export function isAdminPublicPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if a pathname is within the admin panel
 */
export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_BASE_PATH);
}

/**
 * Validate and sanitize a callback URL
 * Returns the admin base path if URL is invalid or too long
 */
export function getSafeCallbackUrl(url: string | null): string {
  if (!url) return ADMIN_BASE_PATH;

  // Must start with admin base path
  if (!url.startsWith(ADMIN_BASE_PATH)) return ADMIN_BASE_PATH;

  // Limit length to prevent abuse
  if (url.length > MAX_CALLBACK_URL_LENGTH) return ADMIN_BASE_PATH;

  // Block any URL with suspicious patterns
  if (url.includes('..') || url.includes('//') || url.includes('\0')) {
    return ADMIN_BASE_PATH;
  }

  return url;
}
