import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/database';

describe('Client API', () => {
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

  beforeEach(async () => {
    // Only clean up clients before each test
    await prisma.client.deleteMany({});
  });

  describe('POST /api/clients', () => {
    it('should create a new client with valid data', async () => {
      const clientData = {
        name: 'Test Client',
        company: 'Test Company',
        contactName: 'John Doe',
        email: 'john@testcompany.com',
        phone: '+1234567890',
        notes: 'Test notes',
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: clientData.name,
        company: clientData.company,
        contactName: clientData.contactName,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes,
        createdBy: testUser.id,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should create a client with only required fields', async () => {
      const clientData = {
        name: 'Minimal Client',
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(clientData.name);
      expect(response.body.data.company).toBeNull();
      expect(response.body.data.contactName).toBeNull();
      expect(response.body.data.email).toBeNull();
      expect(response.body.data.phone).toBeNull();
      expect(response.body.data.notes).toBeNull();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContainEqual({
        field: 'name',
        message: expect.stringContaining('required'),
      });
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Create test clients
      await prisma.client.createMany({
        data: [
          {
            name: 'Alpha Client',
            company: 'Alpha Corp',
            createdBy: testUser.id,
          },
          { name: 'Beta Client', company: 'Beta Inc', createdBy: testUser.id },
          {
            name: 'Gamma Client',
            company: 'Gamma LLC',
            createdBy: testUser.id,
          },
        ],
      });
    });

    it('should return paginated list of clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/clients?search=Alpha')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].name).toBe('Alpha Client');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/clients?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/clients?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].name).toBe('Alpha Client');
      expect(response.body.data.data[1].name).toBe('Beta Client');
      expect(response.body.data.data[2].name).toBe('Gamma Client');
    });

    it('should include related data counts', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((client: any) => {
        expect(client._count).toMatchObject({
          proposals: expect.any(Number),
          bookings: expect.any(Number),
        });
      });
    });
  });

  describe('GET /api/clients/:id', () => {
    let testClient: any;

    beforeEach(async () => {
      testClient = await prisma.client.create({
        data: {
          name: 'Test Client Detail',
          company: 'Test Company',
          createdBy: testUser.id,
        },
      });
    });

    it('should return client details with related data', async () => {
      const response = await request(app)
        .get(`/api/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testClient.id,
        name: testClient.name,
        company: testClient.company,
      });
      expect(response.body.data.createdByUser).toMatchObject({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
      });
      expect(response.body.data.proposals).toBeDefined();
      expect(response.body.data.bookings).toBeDefined();
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .get('/api/clients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid client ID', async () => {
      const response = await request(app)
        .get('/api/clients/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/clients/:id', () => {
    let testClient: any;

    beforeEach(async () => {
      testClient = await prisma.client.create({
        data: {
          name: 'Original Client',
          company: 'Original Company',
          createdBy: testUser.id,
        },
      });
    });

    it('should update client with valid data', async () => {
      const updateData = {
        name: 'Updated Client',
        company: 'Updated Company',
        contactName: 'Jane Doe',
        email: 'jane@updated.com',
        phone: '+9876543210',
        notes: 'Updated notes',
      };

      const response = await request(app)
        .put(`/api/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updateData);
      expect(response.body.data.updatedAt).not.toBe(testClient.updatedAt);
    });

    it('should update only provided fields', async () => {
      const updateData = {
        name: 'Partially Updated Client',
      };

      const response = await request(app)
        .put(`/api/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.company).toBe(testClient.company);
    });

    it('should return 404 for non-existent client', async () => {
      const updateData = {
        name: 'Updated Client',
      };

      const response = await request(app)
        .put('/api/clients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid email format', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const response = await request(app)
        .put(`/api/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('should delete client without dependencies', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Client to Delete',
          createdBy: testUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client deleted successfully');

      // Verify client is deleted
      const deletedClient = await prisma.client.findUnique({
        where: { id: client.id },
      });
      expect(deletedClient).toBeNull();
    });

    it('should prevent deletion of client with proposals', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Client with Proposal',
          createdBy: testUser.id,
        },
      });

      // Create a proposal for the client
      await prisma.proposal.create({
        data: {
          clientId: client.id,
          createdBy: testUser.id,
          status: 'draft',
        },
      });

      const response = await request(app)
        .delete(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
      expect(response.body.error.message).toContain('Cannot delete client');
    });
  });
});
