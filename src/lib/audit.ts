import { redis } from './redis';

// ============================================
// Audit Log Types
// ============================================
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT';

export type AuditResource = 'Service' | 'Category' | 'Session' | '2FA' | 'TrustedDevice' | 'Image';

interface AuditLogEntry {
  timestamp: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

// ============================================
// Audit Logging Functions
// ============================================

/**
 * Log an admin action to Redis for audit trail
 * Falls back to console logging if Redis fails
 * Logs are stored with 90-day TTL for compliance
 */
export async function logAdminAction(
  entry: Omit<AuditLogEntry, 'timestamp'>
): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  try {
    const logKey = `audit:${entry.resource.toLowerCase()}:${Date.now()}`;
    const timelineKey = `audit:timeline:${entry.userId}`;
    const now = Date.now();

    // OPTIMIZATION: Use Redis pipeline to batch all operations in a single round-trip
    // This reduces latency from ~3 RTTs to ~1 RTT
    const pipeline = redis.pipeline();

    // Store log entry with 90-day TTL (7776000 seconds)
    pipeline.set(logKey, JSON.stringify(logEntry), { ex: 7776000 });

    // Add to sorted set for easy retrieval by time
    pipeline.zadd(timelineKey, { score: now, member: logKey });

    // Keep only last 1000 entries per user
    pipeline.zremrangebyrank(timelineKey, 0, -1001);

    // Execute all commands in one round-trip
    await pipeline.exec();
  } catch (error) {
    // Fallback to console logging - ensures audit trail even when Redis down
    console.warn(
      `[AUDIT] ${logEntry.timestamp} | ${logEntry.action} | ${logEntry.resource} | ${logEntry.resourceId} | ${logEntry.userEmail}`,
      logEntry.resourceName ? `| ${logEntry.resourceName}` : ''
    );
    console.error('[AUDIT] Redis logging failed:', error);
  }
}

/**
 * Get recent audit logs for a user
 * Uses MGET for efficient batch retrieval
 */
export async function getAuditLogs(
  userId: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  try {
    const keys = await redis.zrange(`audit:timeline:${userId}`, -limit, -1);

    if (!keys.length) return [];

    // Use MGET for batch retrieval (more efficient than N individual GETs)
    const logs = await redis.mget<string[]>(...(keys as string[]));

    return logs
      .filter((log): log is string => log !== null)
      .map((log) => JSON.parse(log) as AuditLogEntry)
      .reverse();
  } catch (error) {
    console.error('[AUDIT] Failed to fetch logs:', error);
    return [];
  }
}
