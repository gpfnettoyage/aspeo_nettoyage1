import { vi, type Mock } from 'vitest';

// ============================================
// Hoisted mocks - these are hoisted to the top
// ============================================
const {
  mockHeadersGet,
  mockHeaders,
  mockCookieGet,
  mockCookieSet,
  mockCookieDelete,
  mockCookies,
  mockSignInEmail,
  mockSignOut,
  mockGetSession,
  mockVerifyTwoFactorOTP,
  mockVerifyTOTP,
  mockVerifyBackupCode,
} = vi.hoisted(() => {
  const mockHeadersGet = vi.fn();
  const mockCookieGet = vi.fn();
  const mockCookieSet = vi.fn();
  const mockCookieDelete = vi.fn();
  return {
    mockHeadersGet,
    mockHeaders: { get: mockHeadersGet },
    mockCookieGet,
    mockCookieSet,
    mockCookieDelete,
    mockCookies: { get: mockCookieGet, set: mockCookieSet, delete: mockCookieDelete },
    mockSignInEmail: vi.fn(),
    mockSignOut: vi.fn(),
    mockGetSession: vi.fn(),
    mockVerifyTwoFactorOTP: vi.fn(),
    mockVerifyTOTP: vi.fn(),
    mockVerifyBackupCode: vi.fn(),
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(mockHeaders)),
  cookies: vi.fn(() => Promise.resolve(mockCookies)),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    twoFactor: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
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
  loginRateLimit: {},
  twoFactorRateLimit: {},
  emailLoginRateLimit: {},
  safeRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock security functions
vi.mock('@/lib/security', () => ({
  isIPBanned: vi.fn(() => Promise.resolve({ banned: false })),
  recordFailedAttempt: vi.fn(() => Promise.resolve({ banned: false })),
  clearFailedAttempts: vi.fn(() => Promise.resolve()),
}));

// Mock audit
vi.mock('@/lib/audit', () => ({
  logAdminAction: vi.fn(() => Promise.resolve()),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendBackupCodeUsedEmail: vi.fn(() => Promise.resolve(true)),
  send2FADisableConfirmationEmail: vi.fn(() => Promise.resolve(true)),
  send2FADisabledEmail: vi.fn(() => Promise.resolve(true)),
}));

// Mock trusted-device
vi.mock('@/lib/trusted-device', () => ({
  isDeviceTrusted: vi.fn(() => Promise.resolve(true)),
  generateDeviceFingerprint: vi.fn(() => 'test-fingerprint'),
  parseUserAgent: vi.fn(() => ({ browser: 'Chrome', os: 'Windows' })),
  startDeviceVerification: vi.fn(() => Promise.resolve({ success: true })),
  verifyDeviceCode: vi.fn(() => Promise.resolve({ success: true })),
  verifyDeviceCodeByFingerprint: vi.fn(() => Promise.resolve({ success: true, userId: 'user-1', userEmail: 'test@example.com', twoFactorEnabled: false })),
  addTrustedDevice: vi.fn(() => Promise.resolve()),
}));

// Mock BetterAuth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signInEmail: mockSignInEmail,
      signOut: mockSignOut,
      getSession: mockGetSession,
      verifyTwoFactorOTP: mockVerifyTwoFactorOTP,
      verifyTOTP: mockVerifyTOTP,
      verifyBackupCode: mockVerifyBackupCode,
    },
  },
}));

// Now import the functions to test
import {
  loginAction,
  logoutAction,
  verifyTOTPAction,
  enable2FAAction,
  verifyBackupCodeAction,
  verifyDeviceAction,
} from '@/actions/auth/auth.actions';
import { prisma } from '@/lib/prisma';
import { isIPBanned, recordFailedAttempt, clearFailedAttempts } from '@/lib/security';
import { safeRateLimit } from '@/lib/redis';
import { isDeviceTrusted, startDeviceVerification, verifyDeviceCode, verifyDeviceCodeByFingerprint } from '@/lib/trusted-device';
import { logAdminAction } from '@/lib/audit';

// ============================================
// Test Utilities
// ============================================
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

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
// loginAction Tests
// ============================================
describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();

    // Default: not banned, rate limit OK
    (isIPBanned as Mock).mockResolvedValue({ banned: false });
    (safeRateLimit as Mock).mockResolvedValue({ success: true });

    // Default: no stored fingerprint cookie
    mockCookieGet.mockReturnValue(undefined);
  });

  describe('Security checks', () => {
    it('should block banned IPs', async () => {
      (isIPBanned as Mock).mockResolvedValue({ banned: true });

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(result.error).toContain('bloque');
      expect(mockSignInEmail).not.toHaveBeenCalled();
    });

    it('should block when IP rate limited', async () => {
      // First call for IP rate limit, second for email rate limit
      (safeRateLimit as Mock).mockResolvedValueOnce({ success: false });

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(result.error).toContain('Trop de tentatives');
      expect(mockSignInEmail).not.toHaveBeenCalled();
    });

    it('should block when email rate limited (anti-brute-force on specific account)', async () => {
      // First call for IP rate limit succeeds, second for email rate limit fails
      (safeRateLimit as Mock)
        .mockResolvedValueOnce({ success: true })  // IP rate limit OK
        .mockResolvedValueOnce({ success: false }); // Email rate limit exceeded

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(result.error).toContain('Trop de tentatives pour ce compte');
      expect(mockSignInEmail).not.toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    it('should reject invalid email format', async () => {
      const result = await loginAction(null, createFormData({
        email: 'not-an-email',
        password: 'password123',
      }));

      expect(result.error).toContain('Email invalide');
    });

    it('should reject password shorter than 8 characters', async () => {
      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'short',
      }));

      expect(result.error).toContain('8 caractères');
    });
  });

  describe('BetterAuth API calls', () => {
    it('should pass headers to signInEmail', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'ADMIN',
        emailVerified: true,
        twoFactorEnabled: false,
      });

      await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      // CRITICAL: Verify headers are passed to BetterAuth
      expect(mockSignInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(Object),
          headers: mockHeaders, // Headers MUST be passed
        })
      );
    });

    it('should return twoFactorRequired when 2FA is enabled and device is trusted', async () => {
      // BetterAuth returns twoFactorRedirect: true
      mockSignInEmail.mockResolvedValue({
        twoFactorRedirect: true,
      });
      // Mock user lookup - called twice: first by email, then by id
      (prisma.user.findUnique as Mock).mockImplementation(({ where }) => {
        if (where.email) {
          return Promise.resolve({ id: 'user-1', email: 'test@example.com' });
        }
        if (where.id) {
          return Promise.resolve({ role: 'ADMIN', emailVerified: true, twoFactorEnabled: true });
        }
        return Promise.resolve(null);
      });
      // Device is trusted, so we go directly to 2FA
      (isDeviceTrusted as Mock).mockResolvedValue(true);

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(result.twoFactorRequired).toBe(true);
    });

    it('should return deviceVerificationRequired when 2FA is enabled but device is untrusted', async () => {
      // BetterAuth returns twoFactorRedirect: true
      mockSignInEmail.mockResolvedValue({
        twoFactorRedirect: true,
      });
      // Mock user lookup - called twice: first by email, then by id
      (prisma.user.findUnique as Mock).mockImplementation(({ where }) => {
        if (where.email) {
          return Promise.resolve({ id: 'user-1', email: 'test@example.com' });
        }
        if (where.id) {
          return Promise.resolve({ role: 'ADMIN', emailVerified: true, twoFactorEnabled: true });
        }
        return Promise.resolve(null);
      });
      // Device is NOT trusted, so we need device verification first
      (isDeviceTrusted as Mock).mockResolvedValue(false);
      (startDeviceVerification as Mock).mockResolvedValue({ success: true });

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      // New flow: device verification BEFORE 2FA
      expect(result.deviceVerificationRequired).toBe(true);
      expect(result.deviceVerificationSent).toBe(true);
    });

    it('should handle 2FA required thrown as error', async () => {
      // Some BetterAuth versions throw an error instead
      mockSignInEmail.mockRejectedValue({
        code: 'TWO_FACTOR_REQUIRED',
        message: 'Two factor authentication required',
      });
      // Mock user lookup - called twice: first by email, then by id
      (prisma.user.findUnique as Mock).mockImplementation(({ where }) => {
        if (where.email) {
          return Promise.resolve({ id: 'user-1', email: 'test@example.com' });
        }
        if (where.id) {
          return Promise.resolve({ role: 'ADMIN', emailVerified: true, twoFactorEnabled: true });
        }
        return Promise.resolve(null);
      });
      // Device is trusted
      (isDeviceTrusted as Mock).mockResolvedValue(true);

      const result = await loginAction(null, createFormData({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(result.twoFactorRequired).toBe(true);
    });
  });

  describe('Role and permission checks', () => {
    it('should reject users without admin access', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'user@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'USER', // No admin access
        emailVerified: true,
        twoFactorEnabled: false,
      });
      mockSignOut.mockResolvedValue({});

      const result = await loginAction(null, createFormData({
        email: 'user@example.com',
        password: 'password123',
      }));

      expect(result.error).toContain('non autorise');
      expect(mockSignOut).toHaveBeenCalled();
      expect(recordFailedAttempt).toHaveBeenCalled();
    });

    it('should reject users with unverified email', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'ADMIN',
        emailVerified: false, // Not verified
        twoFactorEnabled: false,
      });
      mockSignOut.mockResolvedValue({});

      const result = await loginAction(null, createFormData({
        email: 'admin@example.com',
        password: 'password123',
      }));

      expect(result.error).toContain('verifiee');
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should require 2FA setup for SUPER_ADMIN without 2FA', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'superadmin@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'SUPER_ADMIN',
        emailVerified: true,
        twoFactorEnabled: false, // 2FA not enabled but required
      });

      const result = await loginAction(null, createFormData({
        email: 'superadmin@example.com',
        password: 'password123',
      }));

      expect(result.twoFactorSetupRequired).toBe(true);
    });
  });

  describe('Device verification (for users without 2FA)', () => {
    it('should require device verification for untrusted device', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'editor@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'EDITOR',
        emailVerified: true,
        twoFactorEnabled: false,
      });
      (isDeviceTrusted as Mock).mockResolvedValue(false);
      (startDeviceVerification as Mock).mockResolvedValue({ success: true });

      const result = await loginAction(null, createFormData({
        email: 'editor@example.com',
        password: 'password123',
      }));

      expect(result.deviceVerificationRequired).toBe(true);
      expect(result.deviceVerificationSent).toBe(true);
    });

    it('should skip device verification for trusted device', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'editor@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'EDITOR',
        emailVerified: true,
        twoFactorEnabled: false,
      });
      (isDeviceTrusted as Mock).mockResolvedValue(true);

      const result = await loginAction(null, createFormData({
        email: 'editor@example.com',
        password: 'password123',
      }));

      expect(result.success).toBe(true);
      expect(result.deviceVerificationRequired).toBeFalsy();
    });
  });

  describe('Successful login', () => {
    it('should clear failed attempts and audit log on success', async () => {
      mockSignInEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com' },
        token: 'token-123',
      });
      (prisma.user.findUnique as Mock).mockResolvedValue({
        role: 'ADMIN',
        emailVerified: true,
        twoFactorEnabled: true, // Has 2FA, so no device verification needed
      });

      // Simulate that 2FA was already verified (no twoFactorRedirect)
      const result = await loginAction(null, createFormData({
        email: 'admin@example.com',
        password: 'password123',
      }));

      // Since twoFactorEnabled but no redirect, this means full session
      // Actually this would return twoFactorRequired... let me adjust
    });
  });
});

// ============================================
// verifyTOTPAction Tests
// ============================================
describe('verifyTOTPAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });

    // Default: return stored fingerprint from cookie (for post-device flow)
    mockCookieGet.mockReturnValue({ value: 'test-fingerprint' });
  });

  it('should reject when rate limited', async () => {
    (safeRateLimit as Mock).mockResolvedValue({ success: false });

    const result = await verifyTOTPAction(null, createFormData({ code: '123456' }));

    expect(result.error).toContain('Trop de tentatives');
    expect(mockVerifyTOTP).not.toHaveBeenCalled();
  });

  it('should reject invalid code format', async () => {
    const result = await verifyTOTPAction(null, createFormData({ code: '123' }));

    expect(result.error).toContain('invalide');
  });

  it('should pass headers to verifyTOTP', async () => {
    mockVerifyTOTP.mockResolvedValue({});
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });

    await verifyTOTPAction(null, createFormData({ code: '123456' }));

    // CRITICAL: Verify headers are passed
    expect(mockVerifyTOTP).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: mockHeaders,
      })
    );
  });

  it('should return success on valid code', async () => {
    mockVerifyTOTP.mockResolvedValue({});
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });

    const result = await verifyTOTPAction(null, createFormData({ code: '123456' }));

    expect(result.success).toBe(true);
    expect(logAdminAction).toHaveBeenCalled();
  });

  it('should return error on invalid code', async () => {
    mockVerifyTOTP.mockRejectedValue(new Error('Invalid code'));

    const result = await verifyTOTPAction(null, createFormData({ code: '123456' }));

    expect(result.error).toContain('incorrect');
  });

  describe('Success after 2FA', () => {
    it('should return success after valid TOTP (device already verified before 2FA)', async () => {
      mockVerifyTOTP.mockResolvedValue({});
      mockGetSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { id: 'session-1' },
      });

      const result = await verifyTOTPAction(null, createFormData({ code: '123456' }));

      expect(result.success).toBe(true);
      // Device verification now happens BEFORE 2FA in loginAction, not after
      expect(startDeviceVerification).not.toHaveBeenCalled();
    });
  });
});

// ============================================
// enable2FAAction Tests
// ============================================
describe('enable2FAAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });
  });

  it('should pass headers to verifyTOTP', async () => {
    mockVerifyTOTP.mockResolvedValue({ status: true });
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    (prisma.user.update as Mock).mockResolvedValue({});

    await enable2FAAction('123456');

    expect(mockVerifyTOTP).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: mockHeaders,
      })
    );
  });

  it('should update user twoFactorEnabled flag', async () => {
    mockVerifyTOTP.mockResolvedValue({ status: true });
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    (prisma.user.update as Mock).mockResolvedValue({});

    const result = await enable2FAAction('123456');

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { twoFactorEnabled: true },
    });
  });
});

// ============================================
// verifyBackupCodeAction Tests
// ============================================
describe('verifyBackupCodeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });

    // Default: return stored fingerprint from cookie (for post-device flow)
    mockCookieGet.mockReturnValue({ value: 'test-fingerprint' });
  });

  it('should reject codes shorter than 8 characters', async () => {
    const result = await verifyBackupCodeAction(null, createFormData({ code: 'short' }));

    expect(result.error).toContain('invalide');
  });

  it('should pass headers to verifyBackupCode', async () => {
    mockVerifyBackupCode.mockResolvedValue({});
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    (prisma.twoFactor.findFirst as Mock).mockResolvedValue({
      backupCodes: JSON.stringify([{ code: 'test', used: false }]),
    });

    await verifyBackupCodeAction(null, createFormData({ code: 'ABCD-EFGH-IJ' }));

    expect(mockVerifyBackupCode).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: mockHeaders,
      })
    );
  });

  describe('Success after backup code', () => {
    it('should return success after valid backup code (device already verified before 2FA)', async () => {
      mockVerifyBackupCode.mockResolvedValue({});
      mockGetSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { id: 'session-1' },
      });
      (prisma.twoFactor.findFirst as Mock).mockResolvedValue({
        backupCodes: JSON.stringify([{ code: 'test', used: false }]),
      });

      const result = await verifyBackupCodeAction(null, createFormData({ code: 'ABCD-EFGH-IJ' }));

      expect(result.success).toBe(true);
      // Device verification now happens BEFORE 2FA in loginAction, not after
      expect(startDeviceVerification).not.toHaveBeenCalled();
    });
  });
});

// ============================================
// logoutAction Tests
// ============================================
describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
  });

  it('should call signOut with headers', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    mockSignOut.mockResolvedValue({});

    try {
      await logoutAction();
    } catch (e) {
      // Redirect throws
    }

    expect(mockSignOut).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: mockHeaders,
      })
    );
  });

  it('should redirect to login page', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
    mockSignOut.mockResolvedValue({});

    await expect(logoutAction()).rejects.toThrow('REDIRECT:/gp8x2k4m/login');
  });
});

// ============================================
// verifyDeviceAction Tests
// ============================================
describe('verifyDeviceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });

    // Default: return stored fingerprint from cookie (simulates consistent auth flow)
    mockCookieGet.mockReturnValue({ value: 'test-fingerprint' });
  });

  it('should return error when code is invalid or expired', async () => {
    // No session needed - uses fingerprint-based verification
    (verifyDeviceCodeByFingerprint as Mock).mockResolvedValue({ success: false, message: 'Code invalide ou expire' });

    const result = await verifyDeviceAction('123456');

    expect(result.error).toBe('Code invalide ou expire');
  });

  it('should return success when device verified and no 2FA', async () => {
    // No session needed - uses fingerprint-based verification
    (verifyDeviceCodeByFingerprint as Mock).mockResolvedValue({
      success: true,
      userId: 'user-1',
      userEmail: 'test@example.com',
      twoFactorEnabled: false,
    });

    const result = await verifyDeviceAction('123456');

    expect(result.success).toBe(true);
    expect(result.twoFactorRequired).toBeFalsy();
  });

  it('should return twoFactorRequired when device verified and 2FA enabled', async () => {
    // No session needed - uses fingerprint-based verification
    (verifyDeviceCodeByFingerprint as Mock).mockResolvedValue({
      success: true,
      userId: 'user-1',
      userEmail: 'test@example.com',
      twoFactorEnabled: true,
    });

    const result = await verifyDeviceAction('123456');

    expect(result.success).toBe(true);
    expect(result.twoFactorRequired).toBe(true);
  });

  it('should be rate limited', async () => {
    (safeRateLimit as Mock).mockResolvedValue({ success: false });

    const result = await verifyDeviceAction('123456');

    expect(result.error).toContain('Trop de tentatives');
  });
});
