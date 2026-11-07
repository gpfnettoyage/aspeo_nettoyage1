import { vi, type Mock } from 'vitest';

// ============================================
// Hoisted mocks
// ============================================
const {
  mockHeadersGet,
  mockHeaders,
  mockGetSession,
  fingerprintCalls,
} = vi.hoisted(() => {
  const mockHeadersGet = vi.fn();
  const fingerprintCalls: Array<{ data: unknown; ip?: string }> = [];
  return {
    mockHeadersGet,
    mockHeaders: { get: mockHeadersGet },
    mockGetSession: vi.fn(),
    fingerprintCalls,
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(mockHeaders)),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    trustedDevice: {
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
  twoFactorRateLimit: {},
  safeRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock audit
vi.mock('@/lib/audit', () => ({
  logAdminAction: vi.fn(() => Promise.resolve()),
}));

// Mock trusted-device - capture fingerprint generation
vi.mock('@/lib/trusted-device', () => ({
  isDeviceTrusted: vi.fn(() => Promise.resolve(true)),
  getTrustedDevices: vi.fn(() => Promise.resolve([])),
  removeTrustedDevice: vi.fn(() => Promise.resolve(true)),
  startDeviceVerification: vi.fn(() => Promise.resolve({ success: true })),
  verifyDeviceCode: vi.fn(() => Promise.resolve({ success: true })),
  generateDeviceFingerprint: vi.fn((data: unknown, ip?: string) => {
    fingerprintCalls.push({ data, ip });
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, string>;
      return `fp-${obj.userAgent}-${obj.acceptLanguage || ''}-${obj.acceptEncoding || ''}`;
    }
    return `fp-${data}-${ip || ''}`;
  }),
  parseUserAgent: vi.fn(() => ({ browser: 'Chrome', os: 'Windows' })),
}));

// Mock BetterAuth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// Now import the functions to test
import {
  checkDeviceTrust,
  startDeviceVerificationAction,
  verifyDeviceCodeAction,
  getTrustedDevicesAction,
  removeTrustedDeviceAction,
} from '@/actions/auth/device.actions';
import { generateDeviceFingerprint, isDeviceTrusted, verifyDeviceCode } from '@/lib/trusted-device';
import { safeRateLimit } from '@/lib/redis';

// ============================================
// Test Utilities
// ============================================
function setupHeaders(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'x-forwarded-for': '192.168.1.100',
    'accept-language': 'fr-FR,fr;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    // Client Hints for enhanced fingerprinting
    'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-mobile': '?0',
  };
  const headers = { ...defaults, ...overrides };
  mockHeadersGet.mockImplementation((key: string) => headers[key] || null);
}

// ============================================
// Fingerprint Consistency Tests (CRITICAL)
// ============================================
describe('Device Fingerprint Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fingerprintCalls.length = 0; // Clear fingerprint call tracking
    setupHeaders();
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
  });

  describe('checkDeviceTrust', () => {
    it('should use object format with all headers including Client Hints for fingerprint', async () => {
      await checkDeviceTrust();

      expect(generateDeviceFingerprint).toHaveBeenCalledWith({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        acceptLanguage: 'fr-FR,fr;q=0.9',
        acceptEncoding: 'gzip, deflate, br',
        secChUa: '"Chromium";v="120", "Google Chrome";v="120"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0',
      });
    });

    it('should NOT use old format with IP parameter', async () => {
      await checkDeviceTrust();

      // Verify the call was made with object, not (string, string) format
      const lastCall = fingerprintCalls[fingerprintCalls.length - 1];
      expect(typeof lastCall.data).toBe('object');
      expect(lastCall.ip).toBeUndefined();
    });
  });

  describe('startDeviceVerificationAction', () => {
    it('should use object format with all headers including Client Hints for fingerprint', async () => {
      await startDeviceVerificationAction();

      expect(generateDeviceFingerprint).toHaveBeenCalledWith({
        userAgent: expect.any(String),
        acceptLanguage: expect.any(String),
        acceptEncoding: expect.any(String),
        secChUa: expect.any(String),
        secChUaPlatform: expect.any(String),
        secChUaMobile: expect.any(String),
      });
    });
  });

  describe('verifyDeviceCodeAction', () => {
    it('should use object format with all headers including Client Hints for fingerprint', async () => {
      (safeRateLimit as Mock).mockResolvedValue({ success: true });

      await verifyDeviceCodeAction('123456');

      expect(generateDeviceFingerprint).toHaveBeenCalledWith({
        userAgent: expect.any(String),
        acceptLanguage: expect.any(String),
        acceptEncoding: expect.any(String),
        secChUa: expect.any(String),
        secChUaPlatform: expect.any(String),
        secChUaMobile: expect.any(String),
      });
    });
  });

  describe('getTrustedDevicesAction', () => {
    it('should use object format with all headers including Client Hints for fingerprint', async () => {
      await getTrustedDevicesAction();

      expect(generateDeviceFingerprint).toHaveBeenCalledWith({
        userAgent: expect.any(String),
        acceptLanguage: expect.any(String),
        acceptEncoding: expect.any(String),
        secChUa: expect.any(String),
        secChUaPlatform: expect.any(String),
        secChUaMobile: expect.any(String),
      });
    });
  });

  describe('Cross-module fingerprint consistency', () => {
    it('should generate same fingerprint format as auth.actions.ts with Client Hints', async () => {
      // This test verifies that device.actions.ts generates fingerprints
      // in the same format as auth.actions.ts would
      const headers = {
        'user-agent': 'TestBrowser/1.0',
        'accept-language': 'en-US',
        'accept-encoding': 'gzip',
        'sec-ch-ua': '"TestBrowser";v="1"',
        'sec-ch-ua-platform': '"TestOS"',
        'sec-ch-ua-mobile': '?0',
      };
      setupHeaders(headers);

      await checkDeviceTrust();

      // Verify the fingerprint call used the full object format with Client Hints
      const call = fingerprintCalls[0];
      expect(call.data).toEqual({
        userAgent: 'TestBrowser/1.0',
        acceptLanguage: 'en-US',
        acceptEncoding: 'gzip',
        secChUa: '"TestBrowser";v="1"',
        secChUaPlatform: '"TestOS"',
        secChUaMobile: '?0',
      });
    });
  });
});

// ============================================
// checkDeviceTrust Tests
// ============================================
describe('checkDeviceTrust', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
  });

  it('should return trusted: false when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await checkDeviceTrust();

    expect(result.trusted).toBe(false);
    expect(isDeviceTrusted).not.toHaveBeenCalled();
  });

  it('should check device trust with fingerprint', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    (isDeviceTrusted as Mock).mockResolvedValue(true);

    const result = await checkDeviceTrust();

    expect(result.trusted).toBe(true);
    expect(isDeviceTrusted).toHaveBeenCalledWith('user-1', expect.any(String));
  });

  it('should return verificationRequired: true when device not trusted', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    (isDeviceTrusted as Mock).mockResolvedValue(false);

    const result = await checkDeviceTrust();

    expect(result.trusted).toBe(false);
    expect(result.verificationRequired).toBe(true);
  });
});

// ============================================
// verifyDeviceCodeAction Tests
// ============================================
describe('verifyDeviceCodeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
  });

  it('should reject when rate limited', async () => {
    (safeRateLimit as Mock).mockResolvedValue({ success: false });

    const result = await verifyDeviceCodeAction('123456');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Trop de tentatives');
  });

  it('should reject when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await verifyDeviceCodeAction('123456');

    expect(result.success).toBe(false);
    expect(result.error).toContain('authentifie');
  });

  it('should verify code with correct fingerprint', async () => {
    (verifyDeviceCode as Mock).mockResolvedValue({ success: true });

    const result = await verifyDeviceCodeAction('123456');

    expect(result.success).toBe(true);
    expect(verifyDeviceCode).toHaveBeenCalledWith(
      'user-1',
      'test@example.com',
      expect.any(String),
      '123456'
    );
  });

  it('should return error on invalid code', async () => {
    (verifyDeviceCode as Mock).mockResolvedValue({
      success: false,
      message: 'Code invalide ou expire',
    });

    const result = await verifyDeviceCodeAction('wrong-code');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Code invalide ou expire');
  });
});

// ============================================
// removeTrustedDeviceAction Tests
// ============================================
describe('removeTrustedDeviceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
  });

  it('should reject when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await removeTrustedDeviceAction('device-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('authentifie');
  });

  it('should return error when device not found', async () => {
    const { removeTrustedDevice } = await import('@/lib/trusted-device');
    (removeTrustedDevice as Mock).mockResolvedValue(false);

    const result = await removeTrustedDeviceAction('non-existent-device');

    expect(result.success).toBe(false);
    expect(result.error).toContain('non trouve');
  });
});
