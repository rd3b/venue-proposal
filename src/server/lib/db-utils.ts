import { Prisma } from '@prisma/client';
import { prisma } from './database';

/**
 * Generic pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Pagination result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Apply pagination to a query
 */
export function applyPagination(options: PaginationOptions) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
export function handlePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return 'A record with this information already exists';
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return 'Cannot delete record due to related data';
      case 'P2014':
        return 'Invalid data provided';
      default:
        return `Database error: ${error.message}`;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Invalid data format provided';
  }

  return error instanceof Error ? error.message : 'Unknown database error';
}

/**
 * Transaction wrapper with error handling
 */
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    throw new Error(handlePrismaError(error));
  }
}

/**
 * Soft delete check - verify if record can be safely deleted
 */
export async function canDeleteClient(
  clientId: number
): Promise<{ canDelete: boolean; reason?: string }> {
  const [proposalCount, bookingCount] = await Promise.all([
    prisma.proposal.count({ where: { clientId } }),
    prisma.booking.count({ where: { clientId } }),
  ]);

  if (proposalCount > 0 || bookingCount > 0) {
    return {
      canDelete: false,
      reason: `Client has ${proposalCount} proposal(s) and ${bookingCount} booking(s)`,
    };
  }

  return { canDelete: true };
}

/**
 * Soft delete check for venues
 */
export async function canDeleteVenue(
  venueId: number
): Promise<{ canDelete: boolean; reason?: string }> {
  const [proposalVenueCount, bookingCount] = await Promise.all([
    prisma.proposalVenue.count({ where: { venueId } }),
    prisma.booking.count({ where: { venueId } }),
  ]);

  if (proposalVenueCount > 0 || bookingCount > 0) {
    return {
      canDelete: false,
      reason: `Venue has ${proposalVenueCount} proposal(s) and ${bookingCount} booking(s)`,
    };
  }

  return { canDelete: true };
}
