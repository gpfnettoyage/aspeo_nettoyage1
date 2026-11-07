import { hashIP } from '@/lib/utils/security';

describe('hashIP', () => {
  it('generates a SHA-256 hash', () => {
    const hash = hashIP('192.168.1.1');

    // SHA-256 produces a 64-character hex string
    expect(hash).toHaveLength(64);
  });

  it('produces a hexadecimal hash', () => {
    const hash = hashIP('10.0.0.1');

    // Should only contain hex characters
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic (same input produces same output)', () => {
    const ip = '203.0.113.195';

    const hash1 = hashIP(ip);
    const hash2 = hashIP(ip);

    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different IPs', () => {
    const hash1 = hashIP('192.168.1.1');
    const hash2 = hashIP('192.168.1.2');

    expect(hash1).not.toBe(hash2);
  });

  it('produces consistent known hash for verification', () => {
    // This test ensures the hashing algorithm has not changed
    const hash = hashIP('127.0.0.1');

    // Pre-computed SHA-256 hash of '127.0.0.1'
    expect(hash).toBe('12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0');
  });

  it('handles IPv6 addresses', () => {
    const hash = hashIP('::1');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles empty string', () => {
    const hash = hashIP('');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
