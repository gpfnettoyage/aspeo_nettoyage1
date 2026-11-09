/**
 * Generic pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination params for server actions
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Default page sizes for different entities
 */
export const DEFAULT_PAGE_SIZES = {
  users: 10,
  services: 15,
  categories: 10,
  securityLogs: 20,
  bannedIPs: 10,
} as const;

/**
 * Calculate pagination values
 */
export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));

  return {
    page: validPage,
    pageSize,
    total,
    totalPages,
  };
}

/**
 * Calculate skip value for Prisma
 */
export function getSkip(page: number, pageSize: number): number {
  return (Math.max(1, page) - 1) * pageSize;
}
