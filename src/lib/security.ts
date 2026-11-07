import { redis } from './redis';
import {
  type PaginationMeta,
  DEFAULT_PAGE_SIZES,
  calculatePagination,
} from '@/types/pagination';

// ============================================
// Environment Detection
// ============================================
/**
 * Check if running in development/test environment
 * Must be a function (not constant) for proper test mocking via vi.stubEnv
 */
function isDevOrTest(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.CI === 'true';
}

// ============================================
// Security Configuration (externalized via env)
// ============================================
const FAILED_ATTEMPTS_THRESHOLD = parseInt(process.env.SECURITY_FAILED_ATTEMPTS_THRESHOLD || '10', 10);
const FAILED_ATTEMPTS_WINDOW = parseInt(process.env.SECURITY_FAILED_ATTEMPTS_WINDOW || '900', 10); // 15 min default
const BAN_DURATION = parseInt(process.env.SECURITY_BAN_DURATION || '3600', 10); // 1 hour default
const FAILED_ATTEMPTS_TTL = parseInt(process.env.SECURITY_FAILED_ATTEMPTS_TTL || '86400', 10); // 24h default

// ============================================
// IP Validation
// ============================================
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:$|^(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}$|^(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}$|^(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}$|^[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}$/;

/**
 * Validate IP address format (IPv4 or IPv6)
 * Prevents injection attacks via malformed IP strings
 */
export function isValidIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return false;
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
}

// ============================================
// Types
// ============================================
export interface FailedAttempt {
  ip: string;
  email: string;
  timestamp: string;
  userAgent?: string;
}

export interface BannedIP {
  ip: string;
  reason: string;
  bannedAt: string;
  expiresAt: string;
  attemptCount: number;
}

export interface SecurityStats {
  failedAttemptsLast24h: number;
  bannedIPsCount: number;
  recentFailedAttempts: FailedAttempt[];
  bannedIPs: BannedIP[];
}

export interface PaginatedBannedIPs {
  data: BannedIP[];
  meta: PaginationMeta;
}

export interface PaginatedFailedAttempts {
  data: FailedAttempt[];
  meta: PaginationMeta;
}

export interface IPBanCheckResult {
  banned: boolean;
  redisDown?: boolean;
}

// ============================================
// IP Ban Functions
// ============================================

/**
 * Check if an IP is banned
 * SECURITY: Fail-closed in production to prevent ban bypass during Redis outages
 *
 * @returns Object with banned status and optional redisDown flag
 */
export async function isIPBanned(ip: string): Promise<IPBanCheckResult> {
  // Invalid IP format - don't even check Redis
  if (!isValidIP(ip)) {
    return { banned: false };
  }

  try {
    const banned = await redis.get(`security:banned:${ip}`);
    return { banned: banned !== null };
  } catch (error) {
    // Only log in production to reduce noise in dev/test
    if (!isDevOrTest()) {
      console.error('[SECURITY] Failed to check IP ban:', error);
    }

    // Development/Test: fail-open with warning (for local dev without Redis)
    if (isDevOrTest()) {
      return { banned: false, redisDown: true };
    }

    // PRODUCTION: fail-closed - block request when Redis is down
    // This prevents attackers from bypassing bans by DDoS-ing Redis
    console.error('[CRITICAL] Redis down in production - blocking request for security');
    return { banned: true, redisDown: true };
  }
}

/**
 * Ban an IP address
 */
export async function banIP(
  ip: string,
  reason: string,
  duration: number = BAN_DURATION
): Promise<void> {
  try {
    const banData: BannedIP = {
      ip,
      reason,
      bannedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
      attemptCount: await getFailedAttemptCount(ip),
    };

    // Store ban with TTL
    await redis.set(`security:banned:${ip}`, JSON.stringify(banData), {
      ex: duration,
    });

    // Add to banned IPs set for listing
    await redis.zadd('security:banned:list', {
      score: Date.now(),
      member: ip,
    });

    console.warn(`[SECURITY] IP banned: ${ip} - Reason: ${reason}`);
  } catch (error) {
    console.error('[SECURITY] Failed to ban IP:', error);
  }
}

/**
 * Unban an IP address
 */
export async function unbanIP(ip: string): Promise<void> {
  try {
    await redis.del(`security:banned:${ip}`);
    await redis.zrem('security:banned:list', ip);
    console.warn(`[SECURITY] IP unbanned: ${ip}`);
  } catch (error) {
    console.error('[SECURITY] Failed to unban IP:', error);
  }
}

/**
 * Get all currently banned IPs
 * Uses MGET for efficient batch retrieval (prevents N+1 queries)
 */
export async function getBannedIPs(): Promise<BannedIP[]> {
  try {
    const ips = await redis.zrange('security:banned:list', 0, -1);
    if (!ips.length) return [];

    // Build keys for MGET (efficient batch retrieval)
    const keys = (ips as string[]).map((ip) => `security:banned:${ip}`);

    // Single MGET instead of N individual GETs
    // Upstash Redis auto-parses JSON, so data may be object or string
    const bansData = await redis.mget<(BannedIP | string | null)[]>(...keys);

    const bans: BannedIP[] = [];
    const expiredIPs: string[] = [];

    bansData.forEach((data, index) => {
      if (data) {
        if (typeof data === 'string') {
          bans.push(JSON.parse(data) as BannedIP);
        } else {
          bans.push(data as BannedIP);
        }
      } else {
        // IP expired, mark for cleanup
        expiredIPs.push(ips[index] as string);
      }
    });

    // Cleanup expired IPs asynchronously (don't block response)
    if (expiredIPs.length > 0) {
      redis.zrem('security:banned:list', ...expiredIPs).catch((err) => {
        console.error('[SECURITY] Failed to cleanup expired IPs:', err);
      });
    }

    return bans;
  } catch (error) {
    console.error('[SECURITY] Failed to get banned IPs:', error);
    return [];
  }
}

/**
 * Get banned IPs with pagination
 */
export async function getBannedIPsPaginated(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZES.bannedIPs
): Promise<PaginatedBannedIPs> {
  try {
    const total = await redis.zcard('security:banned:list');
    if (total === 0) {
      return { data: [], meta: calculatePagination(1, pageSize, 0) };
    }

    const skip = (page - 1) * pageSize;
    const ips = await redis.zrange('security:banned:list', skip, skip + pageSize - 1);
    if (!ips.length) {
      return { data: [], meta: calculatePagination(page, pageSize, total) };
    }

    const keys = (ips as string[]).map((ip) => `security:banned:${ip}`);
    const bansData = await redis.mget<(BannedIP | string | null)[]>(...keys);

    const bans: BannedIP[] = [];
    const expiredIPs: string[] = [];

    bansData.forEach((data, index) => {
      if (data) {
        if (typeof data === 'string') {
          bans.push(JSON.parse(data) as BannedIP);
        } else {
          bans.push(data as BannedIP);
        }
      } else {
        expiredIPs.push(ips[index] as string);
      }
    });

    if (expiredIPs.length > 0) {
      redis.zrem('security:banned:list', ...expiredIPs).catch((err) => {
        console.error('[SECURITY] Failed to cleanup expired IPs:', err);
      });
    }

    return {
      data: bans,
      meta: calculatePagination(page, pageSize, total - expiredIPs.length),
    };
  } catch (error) {
    console.error('[SECURITY] Failed to get paginated banned IPs:', error);
    return { data: [], meta: calculatePagination(1, pageSize, 0) };
  }
}

// ============================================
// Failed Attempt Tracking
// ============================================

/**
 * Record a failed login attempt
 * Auto-bans if threshold is exceeded
 */
export async function recordFailedAttempt(
  ip: string,
  email: string,
  userAgent?: string
): Promise<{ banned: boolean }> {
  try {
    const attempt: FailedAttempt = {
      ip,
      email,
      timestamp: new Date().toISOString(),
      userAgent,
    };

    const attemptKey = `security:failed:${ip}:${Date.now()}`;

    // Store individual attempt
    await redis.set(attemptKey, JSON.stringify(attempt), {
      ex: FAILED_ATTEMPTS_TTL,
    });

    // Add to IP's attempt list
    await redis.zadd(`security:failed:ip:${ip}`, {
      score: Date.now(),
      member: attemptKey,
    });

    // Add to global failed attempts list
    await redis.zadd('security:failed:global', {
      score: Date.now(),
      member: attemptKey,
    });

    // Keep only recent entries in global list (last 1000)
    await redis.zremrangebyrank('security:failed:global', 0, -1001);

    // Check if should auto-ban
    const recentAttempts = await getFailedAttemptCount(ip);

    if (recentAttempts >= FAILED_ATTEMPTS_THRESHOLD) {
      await banIP(
        ip,
        `Auto-banned: ${recentAttempts} failed login attempts in ${FAILED_ATTEMPTS_WINDOW / 60} minutes`
      );
      return { banned: true };
    }

    return { banned: false };
  } catch (error) {
    console.error('[SECURITY] Failed to record attempt:', error);
    return { banned: false };
  }
}

/**
 * Get count of failed attempts for an IP in the time window
 */
export async function getFailedAttemptCount(ip: string): Promise<number> {
  try {
    const windowStart = Date.now() - FAILED_ATTEMPTS_WINDOW * 1000;
    const count = await redis.zcount(
      `security:failed:ip:${ip}`,
      windowStart,
      Date.now()
    );
    return count;
  } catch (error) {
    console.error('[SECURITY] Failed to count attempts:', error);
    return 0;
  }
}

/**
 * Get recent failed attempts (last 24h)
 * Uses MGET for efficient batch retrieval (prevents N+1 queries)
 */
export async function getRecentFailedAttempts(
  limit = 50
): Promise<FailedAttempt[]> {
  try {
    const keys = await redis.zrange('security:failed:global', -limit, -1);
    if (!keys.length) return [];

    // Single MGET instead of N individual GETs
    // Upstash Redis auto-parses JSON, so data may be object or string
    const attemptsData = await redis.mget<(FailedAttempt | string | null)[]>(...(keys as string[]));

    return attemptsData
      .filter((data): data is FailedAttempt | string => data !== null)
      .map((data) => {
        if (typeof data === 'string') {
          return JSON.parse(data) as FailedAttempt;
        }
        return data as FailedAttempt;
      })
      .reverse();
  } catch (error) {
    console.error('[SECURITY] Failed to get recent attempts:', error);
    return [];
  }
}

/**
 * Get recent failed attempts with pagination
 */
export async function getRecentFailedAttemptsPaginated(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZES.securityLogs
): Promise<PaginatedFailedAttempts> {
  try {
    const total = await redis.zcard('security:failed:global');
    if (total === 0) {
      return { data: [], meta: calculatePagination(1, pageSize, 0) };
    }

    // Redis ZRANGE with REVERSE for newest first
    const start = -((page - 1) * pageSize + pageSize);
    const end = -((page - 1) * pageSize + 1);
    const keys = await redis.zrange('security:failed:global', start, end);

    if (!keys.length) {
      return { data: [], meta: calculatePagination(page, pageSize, total) };
    }

    const attemptsData = await redis.mget<(FailedAttempt | string | null)[]>(...(keys as string[]));

    const attempts = attemptsData
      .filter((data): data is FailedAttempt | string => data !== null)
      .map((data) => {
        if (typeof data === 'string') {
          return JSON.parse(data) as FailedAttempt;
        }
        return data as FailedAttempt;
      })
      .reverse();

    return {
      data: attempts,
      meta: calculatePagination(page, pageSize, total),
    };
  } catch (error) {
    console.error('[SECURITY] Failed to get paginated attempts:', error);
    return { data: [], meta: calculatePagination(1, pageSize, 0) };
  }
}

/**
 * Get failed attempts count in last 24h
 */
export async function getFailedAttemptsCount24h(): Promise<number> {
  try {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return await redis.zcount('security:failed:global', dayAgo, Date.now());
  } catch (error) {
    console.error('[SECURITY] Failed to count 24h attempts:', error);
    return 0;
  }
}

// ============================================
// Security Stats
// ============================================

/**
 * Get security statistics for admin dashboard
 */
export async function getSecurityStats(): Promise<SecurityStats> {
  const [failedAttemptsLast24h, bannedIPs, recentFailedAttempts] =
    await Promise.all([
      getFailedAttemptsCount24h(),
      getBannedIPs(),
      getRecentFailedAttempts(20),
    ]);

  return {
    failedAttemptsLast24h,
    bannedIPsCount: bannedIPs.length,
    recentFailedAttempts,
    bannedIPs,
  };
}

/**
 * Clear failed attempts for an IP (after successful login)
 */
export async function clearFailedAttempts(ip: string): Promise<void> {
  try {
    // Get all attempt keys for this IP
    const keys = await redis.zrange(`security:failed:ip:${ip}`, 0, -1);

    if (keys.length) {
      // Remove from global list
      await redis.zrem('security:failed:global', ...keys);
      // Delete the IP's list
      await redis.del(`security:failed:ip:${ip}`);
    }
  } catch (error) {
    console.error('[SECURITY] Failed to clear attempts:', error);
  }
}
