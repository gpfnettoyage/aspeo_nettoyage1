/**
 * Unit Tests: Pagination Utilities
 *
 * Tests for pagination helper functions in src/types/pagination.ts.
 * These are pure functions that calculate pagination metadata.
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePagination,
  getSkip,
  DEFAULT_PAGE_SIZES,
} from '@/types/pagination';

describe('Pagination Utilities', () => {
  describe('calculatePagination', () => {
    it('should calculate correct pagination for first page', () => {
      const result = calculatePagination(1, 10, 100);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('should calculate correct pagination for middle page', () => {
      const result = calculatePagination(5, 10, 100);

      expect(result).toEqual({
        page: 5,
        pageSize: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('should calculate correct pagination for last page', () => {
      const result = calculatePagination(10, 10, 100);

      expect(result).toEqual({
        page: 10,
        pageSize: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('should handle partial last page', () => {
      const result = calculatePagination(1, 10, 25);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3, // ceil(25/10) = 3
      });
    });

    it('should handle empty results', () => {
      const result = calculatePagination(1, 10, 0);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should clamp page to valid range when too high', () => {
      const result = calculatePagination(999, 10, 50);

      expect(result.page).toBe(5); // Max page is 5 for 50 items at 10/page
      expect(result.totalPages).toBe(5);
    });

    it('should clamp page to 1 when negative or zero', () => {
      expect(calculatePagination(0, 10, 50).page).toBe(1);
      expect(calculatePagination(-5, 10, 50).page).toBe(1);
    });

    it('should handle single item', () => {
      const result = calculatePagination(1, 10, 1);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should handle exact page size match', () => {
      const result = calculatePagination(1, 10, 10);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 10,
        totalPages: 1,
      });
    });

    it('should work with various page sizes', () => {
      expect(calculatePagination(1, 15, 100).totalPages).toBe(7); // ceil(100/15)
      expect(calculatePagination(1, 25, 100).totalPages).toBe(4);
      expect(calculatePagination(1, 50, 100).totalPages).toBe(2);
    });
  });

  describe('getSkip', () => {
    it('should return 0 for first page', () => {
      expect(getSkip(1, 10)).toBe(0);
    });

    it('should calculate correct skip for second page', () => {
      expect(getSkip(2, 10)).toBe(10);
    });

    it('should calculate correct skip for arbitrary page', () => {
      expect(getSkip(5, 10)).toBe(40);
      expect(getSkip(3, 25)).toBe(50);
      expect(getSkip(10, 15)).toBe(135);
    });

    it('should handle page 0 as page 1', () => {
      expect(getSkip(0, 10)).toBe(0);
    });

    it('should handle negative page as page 1', () => {
      expect(getSkip(-5, 10)).toBe(0);
    });

    it('should work with different page sizes', () => {
      expect(getSkip(2, 5)).toBe(5);
      expect(getSkip(2, 20)).toBe(20);
      expect(getSkip(2, 50)).toBe(50);
    });
  });

  describe('DEFAULT_PAGE_SIZES', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_PAGE_SIZES.users).toBe(10);
      expect(DEFAULT_PAGE_SIZES.services).toBe(15);
      expect(DEFAULT_PAGE_SIZES.categories).toBe(10);
      expect(DEFAULT_PAGE_SIZES.securityLogs).toBe(20);
      expect(DEFAULT_PAGE_SIZES.bannedIPs).toBe(10);
    });

    it('should have all required keys', () => {
      const keys = Object.keys(DEFAULT_PAGE_SIZES);
      expect(keys).toContain('users');
      expect(keys).toContain('services');
      expect(keys).toContain('categories');
      expect(keys).toContain('securityLogs');
      expect(keys).toContain('bannedIPs');
    });

    it('should have positive integer values', () => {
      Object.values(DEFAULT_PAGE_SIZES).forEach((value) => {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      });
    });
  });
});
