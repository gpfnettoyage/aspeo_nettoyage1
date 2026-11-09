/**
 * IP Address Utilities
 * Centralized functions for IP handling across the application
 */

/**
 * Extract the real client IP address from request headers
 * Handles proxy chains (x-forwarded-for) and various header formats
 *
 * @param headers - Request headers object
 * @returns The client IP address or 'unknown' if not determinable
 */
export function extractClientIP(headers: Headers): string {
  // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
  // We want the first one (original client)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim();
    if (firstIP) return firstIP;
  }

  // Fallback to x-real-ip (set by some proxies like nginx)
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP;

  // Cloudflare specific header
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  return 'unknown';
}
