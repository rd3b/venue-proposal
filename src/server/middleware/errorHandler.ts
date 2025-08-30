import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  field?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public field?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    field?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.details = details;
    this.name = 'AppError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = {
  badRequest: (message: string, field?: string, details?: any) =>
    new AppError(message, 400, 'BAD_REQUEST', field, details),

  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),

  notFound: (message: string = 'Resource not found') =>
    new AppError(message, 404, 'NOT_FOUND'),

  conflict: (message: string, details?: any) =>
    new AppError(message, 409, 'CONFLICT', undefined, details),

  unprocessableEntity: (message: string, field?: string, details?: any) =>
    new AppError(message, 422, 'UNPROCESSABLE_ENTITY', field, details),

  internal: (message: string = 'Internal server error', details?: any) =>
    new AppError(message, 500, 'INTERNAL_ERROR', undefined, details),
};

const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError
): ApiError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';
      return createError.conflict(
        `A record with this ${field} already exists`,
        { field, constraint: 'unique' }
      );

    case 'P2025':
      // Record not found
      return createError.notFound('Record not found');

    case 'P2003':
      // Foreign key constraint violation
      return createError.badRequest(
        'Cannot perform this operation due to related records',
        undefined,
        { constraint: 'foreign_key' }
      );

    case 'P2014':
      // Required relation violation
      return createError.badRequest('Required relation is missing', undefined, {
        constraint: 'required_relation',
      });

    default:
      logger.error('Unhandled Prisma error:', {
        code: error.code,
        message: error.message,
      });
      return createError.internal('Database operation failed');
  }
};

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;

  // Handle different error types
  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = createError.badRequest('Invalid data provided', undefined, {
      type: 'validation',
      details: err.message,
    });
  } else if (err.name === 'ValidationError') {
    error = createError.badRequest('Validation failed', undefined, err.message);
  } else if (err.name === 'CastError') {
    error = createError.badRequest('Invalid ID format');
  } else if (err.name === 'JsonWebTokenError') {
    error = createError.unauthorized('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = createError.unauthorized('Token expired');
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    error = createError.badRequest('Invalid JSON format');
  } else if (err.name === 'PayloadTooLargeError') {
    error = createError.badRequest('Request payload too large', undefined, {
      limit: '10mb',
      type: 'payload_size',
    });
  } else {
    // Unknown error
    error = createError.internal();
    logger.error('Unhandled error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Log error for monitoring (except client errors)
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    logger.error('Server error:', {
      code: error.code,
      message: error.message,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      stack: error.stack,
    });
  } else {
    logger.warn('Client error:', {
      code: error.code,
      message: error.message,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send error response
  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.field && { field: error.field }),
      ...(error.details && { details: error.details }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    (response.error as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
