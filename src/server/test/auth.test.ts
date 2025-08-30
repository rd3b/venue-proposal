import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken, AuthenticatedUser } from '../lib/auth';

const prisma = new PrismaClient();

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:3000';

describe('Authentication System', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('JWT Token Functions', () => {
    const testUser: AuthenticatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'consultant',
      provider: 'google',
      providerId: 'google123',
    };

    test('should generate valid JWT token', () => {
      const token = generateToken(testUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });

    test('should verify valid JWT token', () => {
      const token = generateToken(testUser);
      const verified = verifyToken(token);

      expect(verified.id).toBe(testUser.id);
      expect(verified.email).toBe(testUser.email);
      expect(verified.name).toBe(testUser.name);
      expect(verified.role).toBe(testUser.role);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });

    test('should throw error when JWT_SECRET is missing', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        generateToken(testUser);
      }).toThrow('JWT_SECRET environment variable is required');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('Authentication Routes', () => {
    let testUser: any;
    let authToken: string;

    beforeAll(async () => {
      // Create a test user
      testUser = await prisma.user.create({
        data: {
          email: 'test-auth@example.com',
          name: 'Test Auth User',
          role: 'consultant',
          provider: 'google',
          providerId: 'google-test-123',
        },
      });

      authToken = generateToken({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        provider: testUser.provider,
        providerId: testUser.providerId,
      });
    });

    test('GET /auth/me should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    test('GET /auth/me should return 401 without token', async () => {
      const response = await request(app).get('/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('GET /auth/me should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    test('POST /auth/logout should succeed with valid token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    test('POST /auth/refresh should return new token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);

      // Verify the new token is valid
      const newToken = response.body.data.token;
      const verified = verifyToken(newToken);
      expect(verified.id).toBe(testUser.id);
    });

    test('GET /auth/google should redirect to Google OAuth', async () => {
      const response = await request(app).get('/auth/google').expect(302);

      expect(response.headers.location).toContain('accounts.google.com');
    });

    test('GET /auth/microsoft should redirect to Microsoft OAuth', async () => {
      const response = await request(app).get('/auth/microsoft').expect(302);

      expect(response.headers.location).toContain('login.microsoftonline.com');
    });
  });

  describe('Authentication Middleware', () => {
    let testUser: any;
    let authToken: string;

    beforeAll(async () => {
      // Create a test user
      testUser = await prisma.user.create({
        data: {
          email: 'test-middleware@example.com',
          name: 'Test Middleware User',
          role: 'admin',
          provider: 'google',
          providerId: 'google-middleware-123',
        },
      });

      authToken = generateToken({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        provider: testUser.provider,
        providerId: testUser.providerId,
      });
    });

    test('should authenticate valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject request without authorization header', async () => {
      const response = await request(app).get('/auth/me').expect(401);

      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
