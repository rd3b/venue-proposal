import request from 'supertest';
import app from '../index';

describe('Authentication Integration', () => {
  test('should start server and respond to health check', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  test('should have authentication routes available', async () => {
    // Test Google OAuth route
    const googleResponse = await request(app).get('/auth/google').expect(302);

    expect(googleResponse.headers.location).toContain('accounts.google.com');

    // Test Microsoft OAuth route
    const microsoftResponse = await request(app)
      .get('/auth/microsoft')
      .expect(302);

    expect(microsoftResponse.headers.location).toContain(
      'login.microsoftonline.com'
    );

    // Test protected route without auth
    const meResponse = await request(app).get('/auth/me').expect(401);

    expect(meResponse.body.success).toBe(false);
    expect(meResponse.body.error.code).toBe('MISSING_TOKEN');
  });

  test('should handle 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route').expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  test('should have proper CORS headers', async () => {
    const response = await request(app).get('/health').expect(200);

    // CORS headers should be present
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
