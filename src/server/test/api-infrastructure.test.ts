import request from 'supertest';
import app from '../index';

describe('Core API Infrastructure', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000'
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should reject requests from unauthorized origins', async () => {
      await request(app)
        .get('/api')
        .set('Origin', 'http://malicious-site.com')
        .expect(500); // CORS error
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API routes', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(15)
        .fill(null)
        .map(() =>
          request(app).get('/api').set('Origin', 'http://localhost:3000')
        );

      const responses = await Promise.all(promises);

      // Some requests should succeed, but we should see rate limiting headers
      const successfulResponse = responses.find(r => r.status === 200);
      expect(successfulResponse?.headers).toHaveProperty('ratelimit-limit');
      expect(successfulResponse?.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  describe('Request Validation', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .set('Origin', 'http://localhost:3000')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should handle oversized requests', async () => {
      const largePayload = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .set('Origin', 'http://localhost:3000')
        .send({ data: largePayload })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .set('Origin', 'http://localhost:3000')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API endpoint not found',
        },
        timestamp: expect.any(String),
        path: '/api/non-existent',
      });
    });

    it('should handle errors with proper structure', async () => {
      // This would test actual error scenarios once we have routes that can throw errors
      const response = await request(app)
        .get('/api/non-existent')
        .set('Origin', 'http://localhost:3000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });
  });

  describe('API Base Route', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Venue Finder CRM API');
    });
  });
});
