// Jest setup for server-side tests
import dotenv from 'dotenv';
import { prisma } from '../lib/database';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Test helper functions
export async function createTestUser(overrides: any = {}) {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'consultant',
      provider: 'test',
      providerId: 'test-123',
      ...overrides,
    },
  });
}

export async function createTestClient(createdBy: number, overrides: any = {}) {
  return await prisma.client.create({
    data: {
      name: 'Test Client',
      company: 'Test Company',
      contactName: 'Test Contact',
      email: 'test@client.com',
      phone: '+1234567890',
      notes: 'Test notes',
      createdBy,
      ...overrides,
    },
  });
}

export async function createTestVenue(createdBy: number, overrides: any = {}) {
  return await prisma.venue.create({
    data: {
      name: 'Test Venue',
      location: 'Test Location',
      contactName: 'Test Contact',
      email: 'test@venue.com',
      phone: '+1234567890',
      standardCommission: 10.0,
      notes: 'Test notes',
      createdBy,
      ...overrides,
    },
  });
}

export async function cleanupTestData() {
  // Delete in order to respect foreign key constraints
  await prisma.commissionClaim.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.proposalVenue.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.venue.deleteMany({});
  await prisma.user.deleteMany({});
}
