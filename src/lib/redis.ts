import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Check for Redis configuration
const hasRedisConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.CI === 'true';

if (!hasRedisConfig && isDevOrTest) {
    console.warn('Upstash Redis (KV) environment variables are missing. Rate limiting will use fallback.');
}

export const redis = new Redis({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
});

// ============================================
// Rate limit with secure fallback
// ============================================
export async function safeRateLimit(
    limiter: Ratelimit,
    key: string
): Promise<{ success: boolean; isRedisDown?: boolean }> {
    // In development/test without Redis, allow requests with warning
    if (!hasRedisConfig) {
        if (isDevOrTest) {
            console.warn('[SECURITY] Redis not configured - rate limiting disabled in dev/test');
            return { success: true, isRedisDown: true };
        }
        // In production without Redis config = DENY all requests
        console.error('[CRITICAL] Redis not configured in production - denying request');
        return { success: false, isRedisDown: true };
    }

    try {
        const result = await limiter.limit(key);
        return { success: result.success };
    } catch (error) {
        // Redis is down - DENY request in production (security first)
        if (!isDevOrTest) {
            console.error('[CRITICAL] Redis rate limit failed:', error);
        }

        if (isDevOrTest) {
            // In dev/test, allow but warn
            return { success: true, isRedisDown: true };
        }

        // SECURITY: Deny request when Redis fails in production
        // This prevents brute-force attacks when Redis is compromised/down
        return { success: false, isRedisDown: true };
    }
}

// Create a new ratelimiter, that allows 5 requests per 1 minute
export const loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'ratelimit:login',
});

// Rate limiter for admin actions (50 mutations per hour per session)
export const adminActionRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: 'ratelimit:admin-action',
});

// Rate limiter for admin read operations (200 per minute - more generous)
export const adminReadRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '60 s'),
    analytics: true,
    prefix: 'ratelimit:admin-read',
});

// Rate limiter for 2FA verification (5 attempts per 15 minutes - strict for security)
export const twoFactorRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:2fa',
});

// Rate limiter for contact form (3 submissions per hour per IP - prevent spam)
export const contactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:contact',
});

// ============================================
// Email-based rate limiting (anti-brute-force on specific accounts)
// ============================================
// This prevents attackers with multiple IPs from targeting a specific account
// More lenient than IP-based (10 attempts vs 5) since legitimate users may
// mistype their password multiple times from different locations

// Rate limiter for login attempts per email (10 attempts per 15 minutes)
// This is in ADDITION to IP-based rate limiting for defense in depth
export const emailLoginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    analytics: true,
    prefix: 'ratelimit:login-email',
});
