import { prisma } from './prisma';
import { Service, ServiceContent, ServiceWithContentAndCategory, ServiceOption, flattenService } from '@/types/services';
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
// Server-side only - no client fetching
// ============================================

/**
 * Get all published services with category info
 * Cached for the duration of the request
 */
export const getServices = cache(async (): Promise<ServiceWithContentAndCategory[]> => {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { title: 'asc' },
    include: {
      category: {
        select: { id: true, name: true, slug: true, displayOrder: true },
      },
    },
  });

  return services.map((service) => ({
    ...flattenService({
      ...service,
      content: service.content as unknown as ServiceContent,
    }),
    category: service.category,
  }));
});

/**
 * Get all services with category (including unpublished - for admin)
 * @deprecated Use getAllServicesPaginated for better performance
 */
export const getAllServices = cache(async (): Promise<(Service & { category: { id: string; name: string } | null })[]> => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });

  return services.map((service) => ({
    ...service,
    content: service.content as unknown as ServiceContent,
    category: service.category,
  }));
});

/**
 * Service type for admin table
 */
export type ServiceWithOptionalCategory = Service & { category: { id: string; name: string } | null };

/**
 * Get all services with pagination (for admin)
 */
export async function getAllServicesPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResponse<ServiceWithOptionalCategory>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZES.services;
  const skip = getSkip(page, pageSize);

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      skip,
      take: pageSize,
    }),
    prisma.service.count(),
  ]);

  return {
    data: services.map((service) => ({
      ...service,
      content: service.content as unknown as ServiceContent,
      category: service.category,
    })),
    meta: calculatePagination(page, pageSize, total),
  };
}

/**
 * Get a service by slug with category info
 * Returns null if not found or not published
 */
export const getServiceBySlug = cache(async (slug: string): Promise<ServiceWithContentAndCategory | null> => {
  const service = await prisma.service.findUnique({
    where: { slug, published: true },
    include: {
      category: {
        select: { id: true, name: true, slug: true, displayOrder: true },
      },
    },
  });

  if (!service) {
    return null;
  }

  return {
    ...flattenService({
      ...service,
      content: service.content as unknown as ServiceContent,
    }),
    category: service.category,
  };
});

/**
 * Get a service by slug (including unpublished - for admin)
 */
export const getServiceBySlugAdmin = cache(async (slug: string): Promise<Service | null> => {
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    return null;
  }

  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    subtitle: service.subtitle,
    categoryId: service.categoryId,
    seoTitle: service.seoTitle,
    seoDesc: service.seoDesc,
    published: service.published,
    content: service.content as unknown as ServiceContent,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
});

/**
 * Get a service by ID (for admin)
 */
export const getServiceById = cache(async (id: string): Promise<Service | null> => {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return null;
  }

  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    subtitle: service.subtitle,
    categoryId: service.categoryId,
    seoTitle: service.seoTitle,
    seoDesc: service.seoDesc,
    published: service.published,
    content: service.content as unknown as ServiceContent,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
});

/**
 * Get service options for contact form dropdown
 * Returns service titles with IDs for multi-select
 */
export async function getServiceOptions(): Promise<ServiceOption[]> {
  const services = await prisma.service.findMany({
    where: { published: true },
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  });

  const serviceOptions: ServiceOption[] = services.map((service) => ({
    value: service.id,
    label: service.title,
  }));

  // Add "Autre" option at the end
  serviceOptions.push({
    value: 'autre',
    label: 'Autre',
  });

  return serviceOptions;
}

/**
 * Get selected services labels for email display
 */
export async function getSelectedServicesLabels(
  selectedIds: string[],
  autreService?: string
): Promise<string[]> {
  if (!selectedIds || selectedIds.length === 0) {
    return [];
  }

  // Filter out empty IDs and separate "autre"
  const validIds = selectedIds.filter((id) => id && id.trim() !== '' && id !== 'autre');
  const hasAutre = selectedIds.includes('autre');

  // Fetch services from database
  const services = await prisma.service.findMany({
    where: { id: { in: validIds } },
    select: { title: true },
  });

  const labels = services.map((s) => s.title);

  // Add "Autre" label if selected
  if (hasAutre) {
    labels.push(
      autreService && autreService.trim() !== ''
        ? `Autre : ${autreService.trim()}`
        : 'Autre (non précisé)'
    );
  }

  return labels;
}

/**
 * Get services count (for admin dashboard)
 */
export async function getServicesCount(): Promise<{ total: number; published: number; draft: number }> {
  const [total, published] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { published: true } }),
  ]);

  return {
    total,
    published,
    draft: total - published,
  };
}

/**
 * Check if a slug exists
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const service = await prisma.service.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!service) return false;
  if (excludeId && service.id === excludeId) return false;
  return true;
}

/**
 * Service data for navigation
 */
export interface NavService {
  id: string;
  slug: string;
  title: string;
}

/**
 * Category with services for navigation
 */
export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  services: NavService[];
}

/**
 * Get published services grouped by category for navigation
 * Only returns categories that have at least one published service
 */
export const getServicesForNav = cache(async (): Promise<NavCategory[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      services: {
        where: { published: true },
        orderBy: { title: 'asc' },
        select: { id: true, slug: true, title: true },
      },
    },
  });

  // Filter out categories with no published services
  return categories
    .filter((cat) => cat.services.length > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      displayOrder: cat.displayOrder,
      services: cat.services,
    }));
});
