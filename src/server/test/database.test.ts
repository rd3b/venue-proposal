import { Prisma } from '@prisma/client';
import {
  handlePrismaError,
  applyPagination,
  createPaginatedResult,
} from '../lib/db-utils';

describe('Database Utilities', () => {
  describe('Pagination', () => {
    it('should apply correct pagination parameters', () => {
      const result = applyPagination({ page: 2, limit: 20 });

      expect(result).toEqual({
        skip: 20,
        take: 20,
        page: 2,
        limit: 20,
      });
    });

    it('should handle default pagination values', () => {
      const result = applyPagination({});

      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should enforce maximum limit', () => {
      const result = applyPagination({ limit: 200 });

      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });
  });

  describe('Paginated Results', () => {
    it('should create correct paginated result structure', () => {
      const data = [1, 2, 3, 4, 5];
      const result = createPaginatedResult(data, 25, 2, 5);

      expect(result).toEqual({
        data: [1, 2, 3, 4, 5],
        pagination: {
          page: 2,
          limit: 5,
          total: 25,
          totalPages: 5,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    it('should handle first page correctly', () => {
      const data = [1, 2, 3];
      const result = createPaginatedResult(data, 10, 1, 3);

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle last page correctly', () => {
      const data = [7, 8, 9, 10];
      const result = createPaginatedResult(data, 10, 3, 4);

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle unique constraint violation', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.6.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('A record with this information already exists');
    });

    it('should handle record not found', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.6.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Record not found');
    });

    it('should handle foreign key constraint', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.6.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Cannot delete record due to related data');
    });

    it('should handle validation errors', () => {
      const error = new Prisma.PrismaClientValidationError(
        'Invalid data format',
        { clientVersion: '5.6.0' }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Invalid data format provided');
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic database error');

      const result = handlePrismaError(error);
      expect(result).toBe('Generic database error');
    });
  });
});
