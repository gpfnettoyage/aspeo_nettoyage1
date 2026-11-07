import { vi, type Mock } from 'vitest';

// ============================================
// Hoisted mocks
// ============================================
const {
  mockHeadersGet,
  mockHeaders,
  mockGetSession,
} = vi.hoisted(() => {
  const mockHeadersGet = vi.fn();
  return {
    mockHeadersGet,
    mockHeaders: { get: mockHeadersGet },
    mockGetSession: vi.fn(),
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
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock audit
vi.mock('@/lib/audit', () => ({
  logAdminAction: vi.fn(() => Promise.resolve()),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendSessionRevokedEmail: vi.fn(() => Promise.resolve(true)),
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
  getActiveSessionsAction,
  revokeSessionAction,
  revokeAllOtherSessionsAction,
} from '@/actions/auth/session.actions';
import { prisma } from '@/lib/prisma';
import { sendSessionRevokedEmail } from '@/lib/email';
import { logAdminAction } from '@/lib/audit';

// ============================================
// Test Utilities
// ============================================
function setupHeaders(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0',
    'x-forwarded-for': '192.168.1.100',
  };
  const headers = { ...defaults, ...overrides };
  mockHeadersGet.mockImplementation((key: string) => headers[key] || null);
}

// ============================================
// getActiveSessionsAction Tests
// ============================================
describe('getActiveSessionsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
  });

  it('should return empty array when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getActiveSessionsAction();

    expect(result.sessions).toEqual([]);
    expect(result.error).toContain('authentifie');
  });

  it('should return active sessions with parsed user agent', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'current-session' },
    });
    (prisma.session.findMany as Mock).mockResolvedValue([
      {
        id: 'current-session',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        ipAddress: '192.168.1.100',
        createdAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'other-session',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1.15',
        ipAddress: '10.0.0.1',
        createdAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    const result = await getActiveSessionsAction();

    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0].isCurrent).toBe(true);
    expect(result.sessions[0].browser).toBe('Chrome');
    expect(result.sessions[1].isCurrent).toBe(false);
    expect(result.sessions[1].browser).toBe('Safari');
  });

  it('should only return sessions that are not expired', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'current-session' },
    });

    await getActiveSessionsAction();

    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          expiresAt: { gt: expect.any(Date) },
        },
      })
    );
  });
});

// ============================================
// revokeSessionAction Tests
// ============================================
describe('revokeSessionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'current-session' },
    });
  });

  it('should reject when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await revokeSessionAction('some-session');

    expect(result.success).toBe(false);
    expect(result.error).toContain('authentifie');
  });

  it('should not allow revoking current session', async () => {
    const result = await revokeSessionAction('current-session');

    expect(result.success).toBe(false);
    expect(result.error).toContain('session actuelle');
  });

  it('should reject when session not found', async () => {
    (prisma.session.findFirst as Mock).mockResolvedValue(null);

    const result = await revokeSessionAction('non-existent-session');

    expect(result.success).toBe(false);
    expect(result.error).toContain('non trouvee');
  });

  it('should reject when session belongs to another user', async () => {
    (prisma.session.findFirst as Mock).mockResolvedValue(null); // findFirst with userId filter returns null

    const result = await revokeSessionAction('other-user-session');

    expect(result.success).toBe(false);
  });

  it('should delete session and send notification email', async () => {
    (prisma.session.findFirst as Mock).mockResolvedValue({
      id: 'target-session',
      userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
      ipAddress: '10.0.0.1',
    });
    (prisma.session.delete as Mock).mockResolvedValue({});

    const result = await revokeSessionAction('target-session');

    expect(result.success).toBe(true);
    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: { id: 'target-session' },
    });
    expect(sendSessionRevokedEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        browser: expect.any(String),
        os: expect.any(String),
      }),
      expect.any(Date)
    );
  });

  it('should log the action in audit log', async () => {
    (prisma.session.findFirst as Mock).mockResolvedValue({
      id: 'target-session',
      userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
      ipAddress: '10.0.0.1',
    });
    (prisma.session.delete as Mock).mockResolvedValue({});

    await revokeSessionAction('target-session');

    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'DELETE',
        resource: 'Session',
        resourceId: 'target-session',
      })
    );
  });
});

// ============================================
// revokeAllOtherSessionsAction Tests
// ============================================
describe('revokeAllOtherSessionsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHeaders();
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'current-session' },
    });
  });

  it('should reject when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await revokeAllOtherSessionsAction();

    expect(result.success).toBe(false);
    expect(result.error).toContain('authentifie');
  });

  it('should delete all sessions except current one', async () => {
    (prisma.session.deleteMany as Mock).mockResolvedValue({ count: 3 });

    const result = await revokeAllOtherSessionsAction();

    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        id: { not: 'current-session' },
      },
    });
  });

  it('should log the action in audit log', async () => {
    (prisma.session.deleteMany as Mock).mockResolvedValue({ count: 5 });

    await revokeAllOtherSessionsAction();

    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'DELETE',
        resource: 'Session',
        resourceId: 'all_other',
        details: expect.objectContaining({
          count: 5,
        }),
      })
    );
  });

  it('should handle case when no other sessions exist', async () => {
    (prisma.session.deleteMany as Mock).mockResolvedValue({ count: 0 });

    const result = await revokeAllOtherSessionsAction();

    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
  });
});
