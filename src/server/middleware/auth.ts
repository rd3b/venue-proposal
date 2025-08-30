import { Request, Response, NextFunction } from 'express';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../lib/auth';
import {
  hasPermission,
  hasAnyPermission,
  Permission,
} from '../lib/permissions';

/**
 * Middleware to require specific permissions
 */
export const requirePermission = (permission: Permission) => {
  return [
    authenticateToken,
    (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      if (!hasPermission(req.user, permission)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Permission required: ${permission}`,
          },
        });
        return;
      }

      next();
    },
  ];
};

/**
 * Middleware to require any of the specified permissions
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return [
    authenticateToken,
    (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      if (!hasAnyPermission(req.user, permissions)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `One of these permissions required: ${permissions.join(', ')}`,
          },
        });
        return;
      }

      next();
    },
  ];
};

/**
 * Middleware for resource ownership validation
 * Checks if user can access a resource based on ownership or admin role
 */
export const requireResourceAccess = (
  getResourceCreatorId: (req: Request) => Promise<number | null>
) => {
  return [
    authenticateToken,
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      try {
        const resourceCreatorId = await getResourceCreatorId(req);

        if (resourceCreatorId === null) {
          res.status(404).json({
            success: false,
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: 'Resource not found',
            },
          });
          return;
        }

        // Admin can access all resources, others can only access their own
        if (req.user.role === 'admin' || req.user.id === resourceCreatorId) {
          next();
          return;
        }

        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only access resources you created',
          },
        });
      } catch (error) {
        console.error('Resource access check error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to verify resource access',
          },
        });
      }
    },
  ];
};

// Export commonly used middleware combinations
export const requireAuth = authenticateToken;
export const requireAdmin = requireRole(['admin']);
export const requireConsultant = requireRole(['consultant', 'admin']);

// Export the original auth functions for backward compatibility
export { authenticateToken, requireRole } from '../lib/auth';
