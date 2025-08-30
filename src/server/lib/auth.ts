import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'consultant';
  provider: string;
  providerId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// JWT token generation
export const generateToken = (user: AuthenticatedUser): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
      providerId: user.providerId,
    },
    secret,
    { expiresIn: '7d' }
  );
};

// JWT token verification
export const verifyToken = (token: string): AuthenticatedUser => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      provider: decoded.provider,
      providerId: decoded.providerId,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
      });
      return;
    }

    const user = verifyToken(token);

    // Verify user still exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User no longer exists',
        },
      });
      return;
    }

    authReq.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this action',
        },
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Find or create user from OAuth profile
export const findOrCreateUser = async (profile: any, provider: string) => {
  const email = profile.emails?.[0]?.value;
  const name =
    profile.displayName ||
    profile.name?.givenName + ' ' + profile.name?.familyName;
  const providerId = profile.id;

  if (!email) {
    throw new Error('Email is required from OAuth provider');
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // Update user info if needed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        provider,
        providerId,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new user with consultant role by default
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'consultant',
        provider,
        providerId,
      },
    });
  }

  return user;
};
