import { vi, type Mock } from 'vitest';

// ============================================
// Hoisted mocks
// ============================================
const {
  mockHeadersGet,
  mockHeaders,
  mockRequestPasswordReset,
  mockResetPassword,
} = vi.hoisted(() => {
  const mockHeadersGet = vi.fn();
  return {
    mockHeadersGet,
    mockHeaders: { get: mockHeadersGet },
    mockRequestPasswordReset: vi.fn(),
    mockResetPassword: vi.fn(),
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(mockHeaders)),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      deleteMany: vi.fn(() => Promise.resolve({ count: 2 })),
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
  safeRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock audit
vi.mock('@/lib/audit', () => ({
  logAdminAction: vi.fn(() => Promise.resolve()),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendPasswordChangedEmail: vi.fn(() => Promise.resolve(true)),
}));

// Mock BetterAuth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      requestPasswordReset: mockRequestPasswordReset,
      resetPassword: mockResetPassword,
    },
  },
}));

// Now import the functions to test
import {
  forgotPasswordAction,
  resetPasswordAction,
} from '@/actions/auth/password.actions';
import { safeRateLimit } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { sendPasswordChangedEmail } from '@/lib/email';
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
    'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0',
    'x-forwarded-for': '192.168.1.100',
    'accept-language': 'fr-FR',
    'accept-encoding': 'gzip',
  };
  const headers = { ...defaults, ...overrides };
  mockHeadersGet.mockImplementation((key: string) => headers[key] || null);
}

// ============================================
// forgotPasswordAction Tests
// ============================================
describe('forgotPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    (safeRateLimit as Mock).mockResolvedValue({ success: true });
  });

  describe('Rate limiting', () => {
    it('should reject when rate limited', async () => {
      (safeRateLimit as Mock).mockResolvedValue({ success: false });

      const result = await forgotPasswordAction(null, createFormData({
        email: 'test@example.com',
      }));

      expect(result.error).toContain('Trop de demandes');
      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    it('should reject invalid email format', async () => {
      const result = await forgotPasswordAction(null, createFormData({
        email: 'not-an-email',
      }));

      expect(result.error).toContain('Email invalide');
    });
  });

  describe('BetterAuth API calls', () => {
    it('should pass headers to requestPasswordReset', async () => {
      mockRequestPasswordReset.mockResolvedValue({});

      await forgotPasswordAction(null, createFormData({
        email: 'test@example.com',
      }));

      // CRITICAL: Verify headers are passed
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: mockHeaders,
        })
      );
    });

    it('should lowercase email before sending', async () => {
      mockRequestPasswordReset.mockResolvedValue({});

      await forgotPasswordAction(null, createFormData({
        email: 'TEST@EXAMPLE.COM',
      }));

      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'test@example.com', // Lowercased
          }),
        })
      );
    });
  });

  describe('Security - Email enumeration prevention', () => {
    it('should return success even if email does not exist', async () => {
      mockRequestPasswordReset.mockRejectedValue(new Error('User not found'));

      const result = await forgotPasswordAction(null, createFormData({
        email: 'nonexistent@example.com',
      }));

      // Should NOT reveal that email doesn't exist
      expect(result.success).toBe(true);
      expect(result.message).toContain('Si cette adresse existe');
    });

    it('should return success on valid request', async () => {
      mockRequestPasswordReset.mockResolvedValue({});

      const result = await forgotPasswordAction(null, createFormData({
        email: 'test@example.com',
      }));

      expect(result.success).toBe(true);
      expect(result.message).toContain('Si cette adresse existe');
    });
  });
});

// ============================================
// resetPasswordAction Tests
// ============================================
describe('resetPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
  });

  describe('Input validation', () => {
    it('should reject token shorter than 20 characters', async () => {
      const result = await resetPasswordAction(null, createFormData({
        token: 'short-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(result.error).toContain('Token invalide');
    });

    it('should reject password shorter than 8 characters', async () => {
      const result = await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'short',
        confirmPassword: 'short',
      }));

      expect(result.error).toContain('8 caracteres');
    });

    it('should reject when passwords do not match', async () => {
      const result = await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'password123',
        confirmPassword: 'different-password',
      }));

      expect(result.error).toContain('correspondent pas');
    });
  });

  describe('BetterAuth API calls', () => {
    it('should pass headers to resetPassword', async () => {
      mockResetPassword.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      // CRITICAL: Verify headers are passed
      expect(mockResetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: mockHeaders,
        })
      );
    });
  });

  describe('Session revocation', () => {
    it('should revoke all user sessions after password reset', async () => {
      mockResetPassword.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('Notifications and audit', () => {
    it('should send password changed email', async () => {
      mockResetPassword.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(sendPasswordChangedEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String) // IP address
      );
    });

    it('should log the action in audit log', async () => {
      mockResetPassword.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      await resetPasswordAction(null, createFormData({
        token: 'valid-token-that-is-long-enough',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(logAdminAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userEmail: 'test@example.com',
          action: 'UPDATE',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should return error on invalid token', async () => {
      mockResetPassword.mockResolvedValue(null);

      const result = await resetPasswordAction(null, createFormData({
        token: 'invalid-but-long-enough-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(result.error).toContain('Token invalide');
    });

    it('should return error on API failure', async () => {
      mockResetPassword.mockRejectedValue(new Error('Token expired'));

      const result = await resetPasswordAction(null, createFormData({
        token: 'expired-token-that-is-long-enough',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }));

      expect(result.error).toContain('invalide ou expire');
    });
  });
});
