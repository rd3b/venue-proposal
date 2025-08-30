import express, { Request, Response } from 'express';
import passport from '../config/passport';
import {
  generateToken,
  authenticateToken,
  AuthenticatedRequest,
} from '../lib/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'consultant',
        provider: user.provider,
        providerId: user.providerId,
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_generation_failed`
      );
    }
  }
);

// Microsoft OAuth routes
router.get(
  '/microsoft',
  passport.authenticate('microsoft', {
    session: false,
  })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'consultant',
        provider: user.provider,
        providerId: user.providerId,
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_generation_failed`
      );
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile',
      },
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // Since we're using JWT tokens, logout is handled client-side by removing the token
  // We could implement a token blacklist here if needed for enhanced security
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh token endpoint (optional - generates new token)
router.post(
  '/refresh',
  authenticateToken,
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Get fresh user data and generate new token
      const user = await prisma.user.findUnique({
        where: { id: authReq.user.id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const newToken = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'consultant',
        provider: user.provider,
        providerId: user.providerId,
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider,
          },
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to refresh token',
        },
      });
    }
  }
);

export default router;
