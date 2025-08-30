import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/database';

describe('Venue API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Clean up everything first
    await prisma.commissionClaim.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.proposalVenue.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'consultant',
        provider: 'test',
        providerId: 'test-123',
      },
    });

    // Get auth token
    const authResponse = await request(app)
      .post('/auth/test-login')
      .send({ userId: testUser.id });

    authToken = authResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up everything
    await prisma.commissionClaim.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.proposalVenue.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('POST /api/venues', () => {
    it('should create a new venue', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test City',
        standardCommission: 15.50,
      };

      const response = await request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${authToken}`)
        .send(venueData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(venueData.name);
      expect(response.body.data.location).toBe(venueData.location);
      expect(parseFloat(response.body.data.standardCommission)).toBe(venueData.standardCommission);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/venues')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/venues', () => {
    it('should list venues', async () => {
      const response = await request(app)
        .get('/api/venues')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should search venues by name', async () => {
      // Create a test venue first
      await prisma.venue.create({
        data: {
          name: 'Searchable Venue',
          createdBy: testUser.id,
        },
      });

      const response = await request(app)
        .get('/api/venues?search=Searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/venues')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/venues/:id', () => {
    it('should get venue by ID', async () => {
      const testVenue = await prisma.venue.create({
        data: {
          name: 'Detail Test Venue',
          location: 'Test Location',
          standardCommission: 20.00,
          createdBy: testUser.id,
        },
      });

      const response = await request(app)
        .get(`/api/venues/${testVenue.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testVenue.id);
      expect(response.body.data.name).toBe(testVenue.name);
      expect(response.body.data.location).toBe(testVenue.location);
      expect(parseFloat(response.body.data.standardCommission)).toBe(20.00);
    });

    it('should return 404 for non-existent venue', async () => {
      const response = await request(app)
        .get('/api/venues/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/venues/:id', () => {
    it('should update venue', async () => {
      const testVenue = await prisma.venue.create({
        data: {
          name: 'Update Test Venue',
          createdBy: testUser.id,
        },
      });

      const updateData = {
        name: 'Updated Venue Name',
        location: 'Updated Location',
        standardCommission: 25.00,
      };

      const response = await request(app)
        .put(`/api/venues/${testVenue.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.location).toBe(updateData.location);
      expect(parseFloat(response.body.data.standardCommission)).toBe(updateData.standardCommission);
    });
  });

  describe('DELETE /api/venues/:id', () => {
    it('should delete venue when no dependencies exist', async () => {
      const testVenue = await prisma.venue.create({
        data: {
          name: 'Delete Test Venue',
          createdBy: testUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/venues/${testVenue.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Venue deleted successfully');
    });

    it('should prevent deletion when venue has bookings', async () => {
      const testVenue = await prisma.venue.create({
        data: {
          name: 'Venue with Booking',
          createdBy: testUser.id,
        },
      });

      // Create dependencies
      const client = await prisma.client.create({
        data: {
          name: 'Test Client',
          createdBy: testUser.id,
        },
      });

      const proposal = await prisma.proposal.create({
        data: {
          clientId: client.id,
          createdBy: testUser.id,
        },
      });

      await prisma.booking.create({
        data: {
          proposalId: proposal.id,
          clientId: client.id,
          venueId: testVenue.id,
          createdBy: testUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/venues/${testVenue.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
      expect(response.body.error.message).toContain('Cannot delete venue');
    });
  });
});
