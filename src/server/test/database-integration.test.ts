import { prisma } from '../lib/database';
import { testDatabaseConnection, getDatabaseHealth } from '../lib/db-test';
import { canDeleteClient, canDeleteVenue } from '../lib/db-utils';

// Skip these tests if no database is available
const skipIfNoDatabase = process.env.DATABASE_URL ? describe : describe.skip;

skipIfNoDatabase('Database Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is available
    const connected = await testDatabaseConnection();
    if (!connected) {
      throw new Error('Database connection required for integration tests');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await testDatabaseConnection();
      expect(result).toBe(true);
    });

    it('should return healthy status', async () => {
      const health = await getDatabaseHealth();
      expect(health.status).toBe('healthy');
      expect(health.result).toBeDefined();
    });
  });

  describe('Soft Delete Checks', () => {
    it('should allow deletion of client with no dependencies', async () => {
      // This test assumes no client with ID 99999 exists
      const result = await canDeleteClient(99999);
      expect(result.canDelete).toBe(true);
    });

    it('should allow deletion of venue with no dependencies', async () => {
      // This test assumes no venue with ID 99999 exists
      const result = await canDeleteVenue(99999);
      expect(result.canDelete).toBe(true);
    });
  });

  describe('Basic CRUD Operations', () => {
    let testUserId: number;
    let testClientId: number;
    let testVenueId: number;

    beforeAll(async () => {
      // Create a test user for our operations
      const testUser = await prisma.user.create({
        data: {
          email: 'test-integration@example.com',
          name: 'Test Integration User',
          role: 'consultant',
          provider: 'test',
          providerId: 'test-integration-id',
        },
      });
      testUserId = testUser.id;
    });

    afterAll(async () => {
      // Clean up test data
      if (testClientId) {
        await prisma.client.deleteMany({
          where: { id: testClientId },
        });
      }
      if (testVenueId) {
        await prisma.venue.deleteMany({
          where: { id: testVenueId },
        });
      }
      await prisma.user.deleteMany({
        where: { id: testUserId },
      });
    });

    it('should create and retrieve a client', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Test Integration Client',
          company: 'Test Company',
          contactName: 'Test Contact',
          email: 'test@example.com',
          phone: '+1-555-0123',
          notes: 'Integration test client',
          createdBy: testUserId,
        },
      });

      testClientId = client.id;

      expect(client.name).toBe('Test Integration Client');
      expect(client.company).toBe('Test Company');
      expect(client.createdBy).toBe(testUserId);

      // Retrieve the client
      const retrieved = await prisma.client.findUnique({
        where: { id: client.id },
        include: { createdByUser: true },
      });

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Integration Client');
      expect(retrieved?.createdByUser.email).toBe(
        'test-integration@example.com'
      );
    });

    it('should create and retrieve a venue', async () => {
      const venue = await prisma.venue.create({
        data: {
          name: 'Test Integration Venue',
          location: 'Test Location',
          contactName: 'Venue Contact',
          email: 'venue@example.com',
          phone: '+1-555-0456',
          standardCommission: 10.5,
          notes: 'Integration test venue',
          createdBy: testUserId,
        },
      });

      testVenueId = venue.id;

      expect(venue.name).toBe('Test Integration Venue');
      expect(venue.standardCommission.toNumber()).toBe(10.5);
      expect(venue.createdBy).toBe(testUserId);

      // Retrieve the venue
      const retrieved = await prisma.venue.findUnique({
        where: { id: venue.id },
        include: { createdByUser: true },
      });

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Integration Venue');
      expect(retrieved?.createdByUser.email).toBe(
        'test-integration@example.com'
      );
    });
  });
});
