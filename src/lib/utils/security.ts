import { createHash } from 'crypto';

/**
 * Hashes an IP address using SHA-256 for GDPR compliance.
 * This way we can rate limit without storing PII in plain text.
 */
export function hashIP(ip: string): string {
    return createHash('sha256').update(ip).digest('hex');
}
