/**
 * Integration Tests: Pagination Actions
 *
 * Tests for paginated server actions to verify:
 * 1. Correct pagination metadata calculation
 * 2. Correct data slicing (skip/take)
 * 3. Permission checks are enforced
 * 4. Edge cases (empty results, out of bounds pages)
 */

import { vi, type Mock } from 'vitest';
import type { Role } from '@prisma/client';

// Define mock types for Prisma methods
type MockedPrismaUser = {
  findMany: Mock;
  count: Mock;
};

type MockedPrismaService = {
  findMany: Mock;
  count: Mock;
};

type MockedPrismaCategory = {
  findMany: Mock;
  count: Mock;
};

type MockedPrisma = {
  user: MockedPrismaUser;
  service: MockedPrismaService;
  category: MockedPrismaCategory;
};

// Use vi.hoisted to define mocks that will be hoisted with vi.mock
const {
  mockUserFindMany,
  mockUserCount,
  mockServiceFindMany,
  mockServiceCount,
  mockCategoryFindMany,
  mockCategoryCount,
} = vi.hoisted(() => ({
  mockUserFindMany: vi.fn(),
  mockUserCount: vi.fn(),
  mockServiceFindMany: vi.fn(),
  mockServiceCount: vi.fn(),
  mockCategoryFindMany: vi.fn(),
  mockCategoryCount: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: mockUserFindMany,
      count: mockUserCount,
    },
    service: {
      findMany: mockServiceFindMany,
      count: mockServiceCount,
    },
    category: {
      findMany: mockCategoryFindMany,
      count: mockCategoryCount,
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const { mockRequirePermission } = vi.hoisted(() => ({
  mockRequirePermission: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  requirePermission: mockRequirePermission,
  requireAdmin: vi.fn().mockResolvedValue(true),
}));

// Import actions to test
import { getUsersPaginatedAction } from '@/actions/users/users.actions';
import { getAllServicesPaginated } from '@/lib/services';
import { getCategoriesWithCountPaginated } from '@/lib/categories';
import { prisma } from '@/lib/prisma';

// Type for mocked functions
const mockPrisma = prisma as unknown as MockedPrisma;

// ============================================
// Constants
// ============================================
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// Helper Functions
// ============================================
function createMockSession(role: Role) {
  return {
    user: {
      id: CURRENT_USER_ID,
      email: 'admin@test.com',
      name: 'Admin User',
      role,
    },
    session: {
      id: 'session-id',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  };
}

function createMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@test.com`,
    name: `User ${i + 1}`,
    role: 'VIEWER' as Role,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { sessions: 0 },
  }));
}

function createMockServices(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `service-${i + 1}`,
    slug: `service-${i + 1}`,
    title: `Service ${i + 1}`,
    subtitle: `Subtitle ${i + 1}`,
    categoryId: null,
    seoTitle: null,
    seoDesc: null,
    published: true,
    content: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    category: null,
  }));
}

function createMockCategories(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `category-${i + 1}`,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
    displayOrder: i + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { services: i },
  }));
}

// ============================================
// Test Suite: getUsersPaginatedAction
// ============================================
describe('getUsersPaginatedAction - Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
  });

  it('should return first page with correct metadata', async () => {
    const totalUsers = 25;
    const pageSize = 10;
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(pageSize));
    mockPrisma.user.count.mockResolvedValue(totalUsers);

    const result = await getUsersPaginatedAction({ page: 1, pageSize });

    expect(result.data).toHaveLength(pageSize);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      })
    );
  });

  it('should return correct skip for page 2', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(10));
    mockPrisma.user.count.mockResolvedValue(25);

    await getUsersPaginatedAction({ page: 2, pageSize: 10 });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('should handle empty results', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);

    const result = await getUsersPaginatedAction({ page: 1, pageSize: 10 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('should use default page size when not specified', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(10));
    mockPrisma.user.count.mockResolvedValue(50);

    await getUsersPaginatedAction({});

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10, // DEFAULT_PAGE_SIZES.users
      })
    );
  });

  it('should handle last page with partial results', async () => {
    const partialPage = createMockUsers(5);
    mockPrisma.user.findMany.mockResolvedValue(partialPage);
    mockPrisma.user.count.mockResolvedValue(25);

    const result = await getUsersPaginatedAction({ page: 3, pageSize: 10 });

    expect(result.data).toHaveLength(5);
    expect(result.meta.page).toBe(3);
    expect(result.meta.totalPages).toBe(3);
  });

  it('should require users:view permission', async () => {
    mockRequirePermission.mockRejectedValue(new Error('Unauthorized'));

    await expect(getUsersPaginatedAction({ page: 1 })).rejects.toThrow('Unauthorized');
    expect(mockRequirePermission).toHaveBeenCalledWith('users:view');
  });

  it('should execute findMany and count in parallel', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(10));
    mockPrisma.user.count.mockResolvedValue(100);

    await getUsersPaginatedAction({ page: 1, pageSize: 10 });

    // Both should be called (Promise.all pattern)
    expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
  });
});

// ============================================
// Test Suite: getAllServicesPaginated
// ============================================
describe('getAllServicesPaginated - Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated services', async () => {
    const totalServices = 30;
    const pageSize = 15;
    mockPrisma.service.findMany.mockResolvedValue(createMockServices(pageSize));
    mockPrisma.service.count.mockResolvedValue(totalServices);

    const result = await getAllServicesPaginated({ page: 1, pageSize });

    expect(result.data).toHaveLength(pageSize);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 15,
      total: 30,
      totalPages: 2,
    });
  });

  it('should use correct skip/take for page 2', async () => {
    mockPrisma.service.findMany.mockResolvedValue(createMockServices(15));
    mockPrisma.service.count.mockResolvedValue(30);

    await getAllServicesPaginated({ page: 2, pageSize: 15 });

    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 15,
        take: 15,
      })
    );
  });

  it('should include category relation', async () => {
    mockPrisma.service.findMany.mockResolvedValue(createMockServices(5));
    mockPrisma.service.count.mockResolvedValue(5);

    await getAllServicesPaginated({ page: 1 });

    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          category: expect.any(Object),
        }),
      })
    );
  });

  it('should order by createdAt descending', async () => {
    mockPrisma.service.findMany.mockResolvedValue(createMockServices(5));
    mockPrisma.service.count.mockResolvedValue(5);

    await getAllServicesPaginated({ page: 1 });

    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });
});

// ============================================
// Test Suite: getCategoriesWithCountPaginated
// ============================================
describe('getCategoriesWithCountPaginated - Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated categories with service count', async () => {
    const totalCategories = 20;
    const pageSize = 10;
    mockPrisma.category.findMany.mockResolvedValue(createMockCategories(pageSize));
    mockPrisma.category.count.mockResolvedValue(totalCategories);

    const result = await getCategoriesWithCountPaginated({ page: 1, pageSize });

    expect(result.data).toHaveLength(pageSize);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 20,
      totalPages: 2,
    });
  });

  it('should include _count for services', async () => {
    mockPrisma.category.findMany.mockResolvedValue(createMockCategories(5));
    mockPrisma.category.count.mockResolvedValue(5);

    await getCategoriesWithCountPaginated({ page: 1 });

    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          _count: expect.objectContaining({
            select: { services: true },
          }),
        }),
      })
    );
  });

  it('should order by displayOrder ascending', async () => {
    mockPrisma.category.findMany.mockResolvedValue(createMockCategories(5));
    mockPrisma.category.count.mockResolvedValue(5);

    await getCategoriesWithCountPaginated({ page: 1 });

    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { displayOrder: 'asc' },
      })
    );
  });

  it('should handle page beyond total', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.category.count.mockResolvedValue(5);

    const result = await getCategoriesWithCountPaginated({ page: 10, pageSize: 10 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.page).toBe(1); // Clamped to valid page
  });
});

// ============================================
// Test Suite: Edge Cases
// ============================================
describe('Pagination Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue(createMockSession('SUPER_ADMIN'));
  });

  it('should handle page 0 as page 1', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(10));
    mockPrisma.user.count.mockResolvedValue(50);

    const result = await getUsersPaginatedAction({ page: 0, pageSize: 10 });

    expect(result.meta.page).toBe(1);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('should handle negative page as page 1', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(10));
    mockPrisma.user.count.mockResolvedValue(50);

    const result = await getUsersPaginatedAction({ page: -5, pageSize: 10 });

    expect(result.meta.page).toBe(1);
  });

  it('should handle very large page size', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(100));
    mockPrisma.user.count.mockResolvedValue(100);

    const result = await getUsersPaginatedAction({ page: 1, pageSize: 1000 });

    expect(result.meta.totalPages).toBe(1);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1000 })
    );
  });

  it('should handle single item total', async () => {
    mockPrisma.user.findMany.mockResolvedValue(createMockUsers(1));
    mockPrisma.user.count.mockResolvedValue(1);

    const result = await getUsersPaginatedAction({ page: 1, pageSize: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.totalPages).toBe(1);
  });
});
