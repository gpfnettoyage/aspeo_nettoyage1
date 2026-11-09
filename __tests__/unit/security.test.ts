import { vi } from 'vitest';

// Mock Redis module before importing security functions
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    zadd: vi.fn(),
    zrem: vi.fn(),
    zrange: vi.fn(),
    zcount: vi.fn(),
    zremrangebyrank: vi.fn(),
    mget: vi.fn(),
  },
}));

import {
  isValidIP,
  isIPBanned,
  recordFailedAttempt,
  clearFailedAttempts,
  banIP,
  getFailedAttemptCount,
} from '@/lib/security';
import { redis } from '@/lib/redis';

// Type the mocked redis for better type safety
const mockedRedis = vi.mocked(redis);

describe('Security Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ============================================
  // isValidIP Tests
  // ============================================
  describe('isValidIP', () => {
    describe('IPv4 validation', () => {
      it('should return true for valid IPv4 address', () => {
        expect(isValidIP('192.168.1.1')).toBe(true);
      });

      it('should return true for localhost IPv4', () => {
        expect(isValidIP('127.0.0.1')).toBe(true);
      });

      it('should return true for edge case IPv4 (0.0.0.0)', () => {
        expect(isValidIP('0.0.0.0')).toBe(true);
      });

      it('should return true for edge case IPv4 (255.255.255.255)', () => {
        expect(isValidIP('255.255.255.255')).toBe(true);
      });

      it('should return false for invalid IPv4 with out-of-range octets', () => {
        expect(isValidIP('999.999.999.999')).toBe(false);
      });

      it('should return false for IPv4 with too few octets', () => {
        expect(isValidIP('192.168.1')).toBe(false);
      });

      it('should return false for IPv4 with too many octets', () => {
        expect(isValidIP('192.168.1.1.1')).toBe(false);
      });

      it('should return false for IPv4 with negative numbers', () => {
        expect(isValidIP('-1.168.1.1')).toBe(false);
      });

      it('should return false for IPv4 with letters', () => {
        expect(isValidIP('192.168.1.abc')).toBe(false);
      });
    });

    describe('IPv6 validation', () => {
      it('should return true for IPv6 loopback (::1)', () => {
        expect(isValidIP('::1')).toBe(true);
      });

      it('should return true for valid IPv6 with compression (2001:db8::1)', () => {
        expect(isValidIP('2001:db8::1')).toBe(true);
      });

      it('should return true for full IPv6 address', () => {
        expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      });

      it('should return true for IPv6 with trailing double colon', () => {
        expect(isValidIP('fe80::')).toBe(true);
      });

      it('should return false for invalid IPv6 with too many groups', () => {
        expect(isValidIP('2001:db8:85a3:0000:0000:8a2e:0370:7334:extra')).toBe(false);
      });

      it('should return false for invalid IPv6 with invalid characters', () => {
        expect(isValidIP('2001:db8::gggg')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return false for "unknown"', () => {
        expect(isValidIP('unknown')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isValidIP('')).toBe(false);
      });

      it('should return false for null (as any)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidIP(null as any)).toBe(false);
      });

      it('should return false for undefined (as any)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidIP(undefined as any)).toBe(false);
      });

      it('should return false for whitespace only', () => {
        expect(isValidIP('   ')).toBe(false);
      });

      it('should return false for IP with leading/trailing spaces', () => {
        expect(isValidIP(' 192.168.1.1 ')).toBe(false);
      });
    });
  });

  // ============================================
  // isIPBanned Tests
  // ============================================
  describe('isIPBanned', () => {
    it('should return { banned: false } for non-banned IP', async () => {
      mockedRedis.get.mockResolvedValue(null);

      const result = await isIPBanned('192.168.1.1');

      expect(result).toEqual({ banned: false });
      expect(mockedRedis.get).toHaveBeenCalledWith('security:banned:192.168.1.1');
    });

    it('should return { banned: true } for banned IP', async () => {
      mockedRedis.get.mockResolvedValue(JSON.stringify({
        ip: '192.168.1.1',
        reason: 'Test ban',
        bannedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        attemptCount: 10,
      }));

      const result = await isIPBanned('192.168.1.1');

      expect(result).toEqual({ banned: true });
      expect(mockedRedis.get).toHaveBeenCalledWith('security:banned:192.168.1.1');
    });

    it('should return { banned: false } for invalid IP without checking Redis', async () => {
      const result = await isIPBanned('invalid-ip');

      expect(result).toEqual({ banned: false });
      expect(mockedRedis.get).not.toHaveBeenCalled();
    });

    it('should return { banned: false } for empty IP without checking Redis', async () => {
      const result = await isIPBanned('');

      expect(result).toEqual({ banned: false });
      expect(mockedRedis.get).not.toHaveBeenCalled();
    });

    describe('Redis failure handling', () => {
      it('should return { banned: true, redisDown: true } in production when Redis is down', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('CI', ''); // Must also unset CI to simulate real production
        mockedRedis.get.mockRejectedValue(new Error('Redis connection failed'));

        const result = await isIPBanned('192.168.1.1');

        expect(result).toEqual({ banned: true, redisDown: true });
      });

      it('should return { banned: false, redisDown: true } in development when Redis is down', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        mockedRedis.get.mockRejectedValue(new Error('Redis connection failed'));

        const result = await isIPBanned('192.168.1.1');

        expect(result).toEqual({ banned: false, redisDown: true });
      });
    });
  });

  // ============================================
  // recordFailedAttempt Tests
  // ============================================
  describe('recordFailedAttempt', () => {
    const testIP = '192.168.1.100';
    const testEmail = 'test@example.com';
    const testUserAgent = 'Mozilla/5.0';

    beforeEach(() => {
      mockedRedis.set.mockResolvedValue('OK');
      mockedRedis.zadd.mockResolvedValue(1);
      mockedRedis.zremrangebyrank.mockResolvedValue(0);
    });

    it('should increment the counter and return { banned: false } when under threshold', async () => {
      // Under the threshold (default is 10)
      mockedRedis.zcount.mockResolvedValue(5);

      const result = await recordFailedAttempt(testIP, testEmail, testUserAgent);

      expect(result).toEqual({ banned: false });
      expect(mockedRedis.set).toHaveBeenCalled();
      expect(mockedRedis.zadd).toHaveBeenCalledTimes(2); // IP list + global list
    });

    it('should store attempt with correct data structure', async () => {
      mockedRedis.zcount.mockResolvedValue(1);

      await recordFailedAttempt(testIP, testEmail, testUserAgent);

      // Verify set was called with attempt data
      const setCall = mockedRedis.set.mock.calls[0];
      expect(setCall[0]).toMatch(/^security:failed:192\.168\.1\.100:\d+$/);

      const attemptData = JSON.parse(setCall[1] as string);
      expect(attemptData.ip).toBe(testIP);
      expect(attemptData.email).toBe(testEmail);
      expect(attemptData.userAgent).toBe(testUserAgent);
      expect(attemptData.timestamp).toBeDefined();
    });

    it('should return { banned: true } when threshold is reached', async () => {
      // At or above threshold (default is 10)
      mockedRedis.zcount.mockResolvedValue(10);
      mockedRedis.mget.mockResolvedValue([]);

      const result = await recordFailedAttempt(testIP, testEmail);

      expect(result).toEqual({ banned: true });
    });

    it('should auto-ban IP when threshold is exceeded', async () => {
      mockedRedis.zcount.mockResolvedValue(15);
      mockedRedis.mget.mockResolvedValue([]);

      await recordFailedAttempt(testIP, testEmail);

      // Verify ban was created
      const banSetCalls = mockedRedis.set.mock.calls.filter(
        call => (call[0] as string).startsWith('security:banned:')
      );
      expect(banSetCalls.length).toBeGreaterThan(0);
    });

    it('should handle Redis errors gracefully and return { banned: false }', async () => {
      mockedRedis.set.mockRejectedValue(new Error('Redis error'));

      const result = await recordFailedAttempt(testIP, testEmail);

      expect(result).toEqual({ banned: false });
    });

    it('should add attempt to global failed attempts list', async () => {
      mockedRedis.zcount.mockResolvedValue(1);

      await recordFailedAttempt(testIP, testEmail);

      // Should add to global list
      const globalZaddCall = mockedRedis.zadd.mock.calls.find(
        call => call[0] === 'security:failed:global'
      );
      expect(globalZaddCall).toBeDefined();
    });

    it('should add attempt to IP-specific failed attempts list', async () => {
      mockedRedis.zcount.mockResolvedValue(1);

      await recordFailedAttempt(testIP, testEmail);

      // Should add to IP-specific list
      const ipZaddCall = mockedRedis.zadd.mock.calls.find(
        call => call[0] === `security:failed:ip:${testIP}`
      );
      expect(ipZaddCall).toBeDefined();
    });
  });

  // ============================================
  // clearFailedAttempts Tests
  // ============================================
  describe('clearFailedAttempts', () => {
    const testIP = '192.168.1.100';

    it('should clear all failed attempts for an IP', async () => {
      const attemptKeys = [
        `security:failed:${testIP}:1234567890`,
        `security:failed:${testIP}:1234567891`,
      ];
      mockedRedis.zrange.mockResolvedValue(attemptKeys);
      mockedRedis.zrem.mockResolvedValue(2);
      mockedRedis.del.mockResolvedValue(1);

      await clearFailedAttempts(testIP);

      // Should get keys from IP-specific list
      expect(mockedRedis.zrange).toHaveBeenCalledWith(
        `security:failed:ip:${testIP}`,
        0,
        -1
      );

      // Should remove from global list
      expect(mockedRedis.zrem).toHaveBeenCalledWith(
        'security:failed:global',
        ...attemptKeys
      );

      // Should delete IP-specific list
      expect(mockedRedis.del).toHaveBeenCalledWith(`security:failed:ip:${testIP}`);
    });

    it('should do nothing when no attempts exist for IP', async () => {
      mockedRedis.zrange.mockResolvedValue([]);

      await clearFailedAttempts(testIP);

      expect(mockedRedis.zrem).not.toHaveBeenCalled();
      expect(mockedRedis.del).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockedRedis.zrange.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(clearFailedAttempts(testIP)).resolves.toBeUndefined();
    });
  });

  // ============================================
  // banIP Tests
  // ============================================
  describe('banIP', () => {
    const testIP = '192.168.1.100';
    const testReason = 'Test ban reason';

    beforeEach(() => {
      mockedRedis.set.mockResolvedValue('OK');
      mockedRedis.zadd.mockResolvedValue(1);
      mockedRedis.zcount.mockResolvedValue(5);
    });

    it('should create a ban record with correct data', async () => {
      await banIP(testIP, testReason);

      const setCall = mockedRedis.set.mock.calls.find(
        call => (call[0] as string) === `security:banned:${testIP}`
      );
      expect(setCall).toBeDefined();

      const banData = JSON.parse(setCall![1] as string);
      expect(banData.ip).toBe(testIP);
      expect(banData.reason).toBe(testReason);
      expect(banData.bannedAt).toBeDefined();
      expect(banData.expiresAt).toBeDefined();
      expect(banData.attemptCount).toBe(5);
    });

    it('should set TTL on ban record', async () => {
      const customDuration = 7200; // 2 hours

      await banIP(testIP, testReason, customDuration);

      const setCall = mockedRedis.set.mock.calls.find(
        call => (call[0] as string) === `security:banned:${testIP}`
      );
      expect(setCall![2]).toEqual({ ex: customDuration });
    });

    it('should add IP to banned IPs list', async () => {
      await banIP(testIP, testReason);

      expect(mockedRedis.zadd).toHaveBeenCalledWith(
        'security:banned:list',
        expect.objectContaining({
          member: testIP,
        })
      );
    });

    it('should handle Redis errors gracefully', async () => {
      mockedRedis.set.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(banIP(testIP, testReason)).resolves.toBeUndefined();
    });
  });

  // ============================================
  // getFailedAttemptCount Tests
  // ============================================
  describe('getFailedAttemptCount', () => {
    const testIP = '192.168.1.100';

    it('should return the count of failed attempts within the window', async () => {
      mockedRedis.zcount.mockResolvedValue(7);

      const count = await getFailedAttemptCount(testIP);

      expect(count).toBe(7);
      expect(mockedRedis.zcount).toHaveBeenCalledWith(
        `security:failed:ip:${testIP}`,
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should return 0 when no attempts exist', async () => {
      mockedRedis.zcount.mockResolvedValue(0);

      const count = await getFailedAttemptCount(testIP);

      expect(count).toBe(0);
    });

    it('should return 0 on Redis error', async () => {
      mockedRedis.zcount.mockRejectedValue(new Error('Redis error'));

      const count = await getFailedAttemptCount(testIP);

      expect(count).toBe(0);
    });
  });
});
