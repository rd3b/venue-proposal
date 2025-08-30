import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export class ResponseBuilder {
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: ApiResponse['meta']
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      response.meta = meta;

      // Set pagination headers
      if (meta.total !== undefined) {
        res.set('X-Total-Count', meta.total.toString());
      }
      if (meta.totalPages !== undefined) {
        res.set('X-Page-Count', meta.totalPages.toString());
      }
    }

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const totalPages = Math.ceil(total / limit);

    return this.success(res, data, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    field?: string,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(field && { field }),
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    field?: string,
    details?: any
  ): Response {
    return this.error(res, 'BAD_REQUEST', message, 400, field, details);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, 'NOT_FOUND', message, 404);
  }

  static conflict(res: Response, message: string, details?: any): Response {
    return this.error(res, 'CONFLICT', message, 409, undefined, details);
  }

  static unprocessableEntity(
    res: Response,
    message: string,
    field?: string,
    details?: any
  ): Response {
    return this.error(
      res,
      'UNPROCESSABLE_ENTITY',
      message,
      422,
      field,
      details
    );
  }

  static internal(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): Response {
    return this.error(res, 'INTERNAL_ERROR', message, 500, undefined, details);
  }
}
