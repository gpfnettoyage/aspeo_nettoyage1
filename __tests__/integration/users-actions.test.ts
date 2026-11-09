/**
 * Integration Tests: Users Actions - Privilege Escalation Prevention
 *
 * These tests verify that server actions in users.actions.ts correctly
 * prevent privilege escalation attacks. They test the security boundaries
 * between different role levels (SUPER_ADMIN, ADMIN, EDITOR, VIEWER, USER).
 *
 * Security Rules Tested:
 * 1. Users cannot create accounts with roles >= their own
 * 2. Users cannot modify their own role
 * 3. Users cannot modify users with roles >= their own
 * 4. Users cannot assign roles >= their own
 * 5. Users cannot delete themselves
 * 6. Users cannot delete users with roles >= their own
 * 7. Users cannot reset passwords of users with roles >= their own (except self)
 */

import { vi, type Mock } from 'vitest';
import type { Role } from '@prisma/client';

// Define mock types for Prisma methods
type MockedPrismaUser = {
  findUnique: Mock;
  findMany: Mock;
  findFirst: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  groupBy: Mock;
};

type MockedPrismaAccount = {
  create: Mock;
  updateMany: Mock;
};

type MockedPrismaSession = {
  deleteMany: Mock;
};

type MockedPrisma = {
  user: MockedPrismaUser;
  account: MockedPrismaAccount;
  session: MockedPrismaSession;
  $transaction: Mock;
};

// Use vi.hoisted to define mocks that will be hoisted with vi.mock
const {
  mockUserFindUnique,
  mockUserFindMany,
  mockUserFindFirst,
  mockUserCreate,
  mockUserUpdate,
  mockUserDelete,
  mockUserGroupBy,
  mockAccountCreate,
  mockAccountUpdateMany,
  mockSessionDeleteMany,
  mockTransaction,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserFindMany: vi.fn(),
  mockUserFindFirst: vi.fn(),
  mockUserCreate: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockUserDelete: vi.fn(),
  mockUserGroupBy: vi.fn(),
  mockAccountCreate: vi.fn(),
  mockAccountUpdateMany: vi.fn(),
  mockSessionDeleteMany: vi.fn(),
  mockTransaction: vi.fn(),
}));

// Note: @/lib/auth is already mocked below with the hoisted mock

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      findMany: mockUserFindMany,
      findFirst: mockUserFindFirst,
      create: mockUserCreate,
      update: mockUserUpdate,
      delete: mockUserDelete,
      groupBy: mockUserGroupBy,
    },
    account: {
      create: mockAccountCreate,
      updateMany: mockAccountUpdateMany,
    },
    session: {
      deleteMany: mockSessionDeleteMany,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

// Import mocked modules
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock additional modules needed for sendPasswordResetAction
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({ get: vi.fn() })),
}));

vi.mock('@/lib/email', () => ({
  sendAdminPasswordResetEmail: vi.fn(() => Promise.resolve(true)),
}));

const { mockRequestPasswordReset } = vi.hoisted(() => ({
  mockRequestPasswordReset: vi.fn(() => Promise.resolve({ status: true })),
}));

vi.mock('@/lib/auth', () => ({
  requirePermission: vi.fn(),
  getSession: vi.fn(),
  auth: {
    api: {
      requestPasswordReset: mockRequestPasswordReset,
    },
  },
}));

// Import actions to test
import {
  createUserAction,
  updateUserRoleAction,
  deleteUserAction,
  sendPasswordResetAction,
} from '@/actions/users/users.actions';

// Type for mocked functions - cast prisma to our mock type
const mockRequirePermission = vi.mocked(requirePermission);
const mockPrisma = prisma as unknown as MockedPrisma;

// ============================================
// Constants
// ============================================

// Valid UUID format for test IDs (required by zod schema validation)
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_USER_ID = '00000000-0000-0000-0000-000000000002';
const NEW_USER_ID = '00000000-0000-0000-0000-000000000003';
const NON_EXISTENT_USER_ID = '00000000-0000-0000-0000-000000000999';

// ============================================
// Helper Functions
// ============================================

/**
 * Create a mock session for a user with a specific role
 */
function createMockSession(role: Role, userId: string = CURRENT_USER_ID) {
  return {
    user: {
      id: userId,
      email: 'current@test.com',
      name: 'Current User',
      role,
    },
    session: {
      id: 'session-id',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  };
}

/**
 * Create a mock target user with specific role
 */
function createMockTargetUser(role: Role, id: string = TARGET_USER_ID) {
  return {
    id,
    email: 'target@test.com',
    name: 'Target User',
    role,
  };
}

// ============================================
// Test Suite: createUserAction
// ============================================
describe('createUserAction - Privilege Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock $transaction to execute the callback
    mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => Promise<unknown>) => {
      return callback(mockPrisma as unknown as typeof prisma);
    });
    // Mock no existing user by default
    mockPrisma.user.findUnique.mockResolvedValue(null);
    // Mock user creation
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'new@test.com',
      name: 'New User',
      role: 'EDITOR' as Role,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });
  });

  it('should REJECT when ADMIN tries to create SUPER_ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));

    // Act: Try to create a SUPER_ADMIN
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'SUPER_ADMIN',
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('supérieur ou égal');
    // Verify user was NOT created
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('should REJECT when ADMIN tries to create ADMIN (same level)', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));

    // Act: Try to create another ADMIN
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'ADMIN',
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('supérieur ou égal');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('should ALLOW when ADMIN creates EDITOR (lower role)', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));

    // Act: Create an EDITOR
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'EDITOR',
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should ALLOW when SUPER_ADMIN creates ADMIN', async () => {
    // Setup: SUPER_ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));

    // Act: Create an ADMIN
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'ADMIN',
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should REJECT when SUPER_ADMIN tries to create another SUPER_ADMIN', async () => {
    // Setup: SUPER_ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));

    // Act: Try to create another SUPER_ADMIN
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'SUPER_ADMIN',
    });

    // Assert: Should be rejected (can't create same level)
    expect(result.success).toBe(false);
    expect(result.error).toContain('supérieur ou égal');
  });

  it('should ALLOW when ADMIN creates VIEWER', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));

    // Act: Create a VIEWER
    const result = await createUserAction({
      email: 'new@test.com',
      password: 'SecurePass123',
      role: 'VIEWER',
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});

// ============================================
// Test Suite: updateUserRoleAction
// ============================================
describe('updateUserRoleAction - Privilege Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should REJECT when user tries to modify their own role', async () => {
    // Setup: ADMIN trying to change own role
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN', CURRENT_USER_ID));

    // Act: Try to change own role
    const result = await updateUserRoleAction({
      userId: CURRENT_USER_ID,
      role: 'SUPER_ADMIN',
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('propre rôle');
  });

  it('should REJECT when ADMIN tries to promote EDITOR to ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('EDITOR'));

    // Act: Try to promote EDITOR to ADMIN
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'ADMIN',
    });

    // Assert: Should be rejected (can't assign same level)
    expect(result.success).toBe(false);
    expect(result.error).toContain('supérieur ou égal');
  });

  it('should REJECT when ADMIN tries to promote EDITOR to SUPER_ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('EDITOR'));

    // Act: Try to promote EDITOR to SUPER_ADMIN
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'SUPER_ADMIN',
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('supérieur ou égal');
  });

  it('should REJECT when ADMIN tries to modify another ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('ADMIN'));

    // Act: Try to demote another ADMIN to EDITOR
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'EDITOR',
    });

    // Assert: Should be rejected (can't act on same level)
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible de modifier');
  });

  it('should REJECT when ADMIN tries to modify a SUPER_ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('SUPER_ADMIN'));

    // Act: Try to demote SUPER_ADMIN
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'EDITOR',
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible de modifier');
  });

  it('should ALLOW when SUPER_ADMIN modifies an ADMIN', async () => {
    // Setup: SUPER_ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('ADMIN'));
    mockPrisma.user.update.mockResolvedValue({
      ...createMockTargetUser('EDITOR'),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });

    // Act: Demote ADMIN to EDITOR
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'EDITOR',
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: TARGET_USER_ID },
      data: { role: 'EDITOR' },
    });
  });

  it('should ALLOW when ADMIN demotes EDITOR to VIEWER', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('EDITOR'));
    mockPrisma.user.update.mockResolvedValue({
      ...createMockTargetUser('VIEWER'),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });

    // Act: Demote EDITOR to VIEWER
    const result = await updateUserRoleAction({
      userId: TARGET_USER_ID,
      role: 'VIEWER',
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  it('should return error when target user not found', async () => {
    // Setup: SUPER_ADMIN user session, but target doesn't exist
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // Act: Try to modify non-existent user
    const result = await updateUserRoleAction({
      userId: NON_EXISTENT_USER_ID,
      role: 'EDITOR',
    });

    // Assert: Should fail with not found error
    expect(result.success).toBe(false);
    expect(result.error).toContain('non trouvé');
  });
});

// ============================================
// Test Suite: deleteUserAction
// ============================================
describe('deleteUserAction - Privilege Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should REJECT when user tries to delete themselves', async () => {
    // Setup: User trying to delete themselves
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN', CURRENT_USER_ID));

    // Act: Try to delete self
    const result = await deleteUserAction({ userId: CURRENT_USER_ID });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('propre compte');
  });

  it('should REJECT when ADMIN tries to delete another ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('ADMIN'));

    // Act: Try to delete another ADMIN
    const result = await deleteUserAction({ userId: TARGET_USER_ID });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible de supprimer');
  });

  it('should REJECT when ADMIN tries to delete a SUPER_ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('SUPER_ADMIN'));

    // Act: Try to delete SUPER_ADMIN
    const result = await deleteUserAction({ userId: TARGET_USER_ID });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible de supprimer');
  });

  it('should ALLOW when SUPER_ADMIN deletes an ADMIN', async () => {
    // Setup: SUPER_ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('ADMIN'));
    mockPrisma.user.delete.mockResolvedValue({
      ...createMockTargetUser('ADMIN'),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });

    // Act: Delete ADMIN
    const result = await deleteUserAction({ userId: TARGET_USER_ID });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: TARGET_USER_ID },
    });
  });

  it('should ALLOW when ADMIN deletes an EDITOR', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('EDITOR'));
    mockPrisma.user.delete.mockResolvedValue({
      ...createMockTargetUser('EDITOR'),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });

    // Act: Delete EDITOR
    const result = await deleteUserAction({ userId: TARGET_USER_ID });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockPrisma.user.delete).toHaveBeenCalled();
  });

  it('should ALLOW when ADMIN deletes a VIEWER', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser('VIEWER'));
    mockPrisma.user.delete.mockResolvedValue({
      ...createMockTargetUser('VIEWER'),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      image: null,
    });

    // Act: Delete VIEWER
    const result = await deleteUserAction({ userId: TARGET_USER_ID });

    // Assert: Should succeed
    expect(result.success).toBe(true);
  });

  it('should return error when target user not found', async () => {
    // Setup: SUPER_ADMIN user session, but target doesn't exist
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // Act: Try to delete non-existent user
    const result = await deleteUserAction({ userId: NON_EXISTENT_USER_ID });

    // Assert: Should fail with not found error
    expect(result.success).toBe(false);
    expect(result.error).toContain('non trouvé');
  });

  it('should REJECT when SUPER_ADMIN tries to delete themselves', async () => {
    // Setup: SUPER_ADMIN trying to delete themselves
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN', CURRENT_USER_ID));

    // Act: Try to delete self
    const result = await deleteUserAction({ userId: CURRENT_USER_ID });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('propre compte');
  });
});

// ============================================
// Test Suite: sendPasswordResetAction
// ============================================
describe('sendPasswordResetAction - Privilege Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestPasswordReset.mockResolvedValue({ status: true });
  });

  it('should REJECT when ADMIN tries to send reset to a SUPER_ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue({
      ...createMockTargetUser('SUPER_ADMIN'),
      email: 'superadmin@test.com',
    });

    // Act: Try to send reset to SUPER_ADMIN
    const result = await sendPasswordResetAction({
      userId: TARGET_USER_ID,
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible');
  });

  it('should REJECT when ADMIN tries to send reset to another ADMIN', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue({
      ...createMockTargetUser('ADMIN'),
      email: 'admin@test.com',
    });

    // Act: Try to send reset to another ADMIN
    const result = await sendPasswordResetAction({
      userId: TARGET_USER_ID,
    });

    // Assert: Should be rejected
    expect(result.success).toBe(false);
    expect(result.error).toContain('Impossible');
  });

  it('should ALLOW when SUPER_ADMIN sends reset to an ADMIN', async () => {
    // Setup: SUPER_ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue({
      ...createMockTargetUser('ADMIN'),
      email: 'admin@test.com',
    });

    // Act: Send reset to ADMIN
    const result = await sendPasswordResetAction({
      userId: TARGET_USER_ID,
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockRequestPasswordReset).toHaveBeenCalled();
  });

  it('should ALLOW when ADMIN sends reset to an EDITOR', async () => {
    // Setup: ADMIN user session
    mockRequirePermission.mockResolvedValue(createMockSession('ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue({
      ...createMockTargetUser('EDITOR'),
      email: 'editor@test.com',
    });

    // Act: Send reset to EDITOR
    const result = await sendPasswordResetAction({
      userId: TARGET_USER_ID,
    });

    // Assert: Should succeed
    expect(result.success).toBe(true);
    expect(mockRequestPasswordReset).toHaveBeenCalled();
  });

  it('should return error when target user not found', async () => {
    // Setup: SUPER_ADMIN user session, but target doesn't exist
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // Act: Try to send reset to non-existent user
    const result = await sendPasswordResetAction({
      userId: NON_EXISTENT_USER_ID,
    });

    // Assert: Should fail with not found error
    expect(result.success).toBe(false);
    expect(result.error).toContain('non trouvé');
  });
});

// ============================================
// Test Suite: Role Hierarchy Validation
// ============================================
describe('Role Hierarchy - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserAction - Role Hierarchy Matrix', () => {
    // Test all combinations of actor role trying to create target role
    const testCases = [
      { actor: 'SUPER_ADMIN' as Role, target: 'ADMIN' as Role, allowed: true },
      { actor: 'SUPER_ADMIN' as Role, target: 'EDITOR' as Role, allowed: true },
      { actor: 'SUPER_ADMIN' as Role, target: 'VIEWER' as Role, allowed: true },
      { actor: 'SUPER_ADMIN' as Role, target: 'SUPER_ADMIN' as Role, allowed: false },
      { actor: 'ADMIN' as Role, target: 'EDITOR' as Role, allowed: true },
      { actor: 'ADMIN' as Role, target: 'VIEWER' as Role, allowed: true },
      { actor: 'ADMIN' as Role, target: 'ADMIN' as Role, allowed: false },
      { actor: 'ADMIN' as Role, target: 'SUPER_ADMIN' as Role, allowed: false },
      { actor: 'EDITOR' as Role, target: 'VIEWER' as Role, allowed: true },
      { actor: 'EDITOR' as Role, target: 'EDITOR' as Role, allowed: false },
      { actor: 'EDITOR' as Role, target: 'ADMIN' as Role, allowed: false },
      { actor: 'EDITOR' as Role, target: 'USER' as Role, allowed: true },
      { actor: 'VIEWER' as Role, target: 'USER' as Role, allowed: true },
    ];

    testCases.forEach(({ actor, target, allowed }) => {
      it(`${actor} creating ${target} should be ${allowed ? 'ALLOWED' : 'REJECTED'}`, async () => {
        mockRequirePermission.mockResolvedValue(createMockSession(actor));
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => Promise<unknown>) => {
          return callback(mockPrisma as unknown as typeof prisma);
        });
        mockPrisma.user.create.mockResolvedValue({
          id: NEW_USER_ID,
          email: 'new@test.com',
          name: 'New User',
          role: target,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          twoFactorEnabled: false,
          image: null,
        });

        const result = await createUserAction({
          email: 'new@test.com',
          password: 'SecurePass123',
          role: target,
        });

        expect(result.success).toBe(allowed);
      });
    });
  });

  describe('deleteUserAction - Cannot delete same or higher role', () => {
    const testCases = [
      { actor: 'SUPER_ADMIN' as Role, target: 'ADMIN' as Role, allowed: true },
      { actor: 'SUPER_ADMIN' as Role, target: 'EDITOR' as Role, allowed: true },
      { actor: 'SUPER_ADMIN' as Role, target: 'SUPER_ADMIN' as Role, allowed: false },
      { actor: 'ADMIN' as Role, target: 'EDITOR' as Role, allowed: true },
      { actor: 'ADMIN' as Role, target: 'VIEWER' as Role, allowed: true },
      { actor: 'ADMIN' as Role, target: 'ADMIN' as Role, allowed: false },
      { actor: 'ADMIN' as Role, target: 'SUPER_ADMIN' as Role, allowed: false },
      { actor: 'EDITOR' as Role, target: 'USER' as Role, allowed: true },
      { actor: 'VIEWER' as Role, target: 'USER' as Role, allowed: true },
    ];

    testCases.forEach(({ actor, target, allowed }) => {
      it(`${actor} deleting ${target} should be ${allowed ? 'ALLOWED' : 'REJECTED'}`, async () => {
        mockRequirePermission.mockResolvedValue(createMockSession(actor));
        mockPrisma.user.findUnique.mockResolvedValue(createMockTargetUser(target));
        mockPrisma.user.delete.mockResolvedValue({
          ...createMockTargetUser(target),
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          twoFactorEnabled: false,
          image: null,
        });

        const result = await deleteUserAction({ userId: TARGET_USER_ID });

        expect(result.success).toBe(allowed);
      });
    });
  });
});
