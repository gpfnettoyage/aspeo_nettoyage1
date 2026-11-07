import { prisma } from './prisma';
import { Category, CategoryWithCount, CategoryOption } from '@/types/categories';
import { cache } from 'react';
import {
  type PaginatedResponse,
  type PaginationParams,
  DEFAULT_PAGE_SIZES,
  calculatePagination,
  getSkip,
} from '@/types/pagination';

// ============================================
// Public Data Layer (Direct Prisma queries)
// ============================================

/**
 * Get all categories ordered by displayOrder
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  return categories;
});

/**
 * Get all categories with service count (for admin)
 * @deprecated Use getCategoriesWithCountPaginated for better performance
 */
export const getCategoriesWithCount = cache(async (): Promise<CategoryWithCount[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { services: true },
      },
    },
  });

  return categories;
});

/**
 * Get categories with pagination (for admin)
 */
export async function getCategoriesWithCountPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResponse<CategoryWithCount>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZES.categories;
  const skip = getSkip(page, pageSize);

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { services: true },
        },
      },
      skip,
      take: pageSize,
    }),
    prisma.category.count(),
  ]);

  return {
    data: categories,
    meta: calculatePagination(page, pageSize, total),
  };
}

/**
 * Get a category by slug
 */
export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  return category;
});

/**
 * Get a category by ID
 */
export const getCategoryById = cache(async (id: string): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  return category;
});

/**
 * Get category options for select dropdown
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { displayOrder: 'asc' },
  });

  return categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
}

/**
 * Check if a category slug exists
 */
export async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!category) return false;
  if (excludeId && category.id === excludeId) return false;
  return true;
}

/**
 * Check if a category name exists
 */
export async function categoryNameExists(name: string, excludeId?: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { name },
    select: { id: true },
  });

  if (!category) return false;
  if (excludeId && category.id === excludeId) return false;
  return true;
}
