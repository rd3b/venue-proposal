import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@venuefinder.com' },
    update: {},
    create: {
      email: 'admin@venuefinder.com',
      name: 'Admin User',
      role: 'admin',
      provider: 'google',
      providerId: 'admin-google-id',
    },
  });

  const consultantUser = await prisma.user.upsert({
    where: { email: 'consultant@venuefinder.com' },
    update: {},
    create: {
      email: 'consultant@venuefinder.com',
      name: 'Consultant User',
      role: 'consultant',
      provider: 'microsoft',
      providerId: 'consultant-microsoft-id',
    },
  });

  console.log('Created users:', { adminUser, consultantUser });

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      company: 'Acme Corp',
      contactName: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1-555-0123',
      notes: 'Large corporate client, prefers luxury venues',
      createdBy: consultantUser.id,
    },
  });

  console.log('Created sample client:', client1);

  // Create sample venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Grand Hotel Conference Center',
      location: 'Downtown, City Center',
      contactName: 'Sarah Johnson',
      email: 'events@grandhotel.com',
      phone: '+1-555-0456',
      standardCommission: 10.00,
      notes: 'Premium venue with excellent AV facilities',
      createdBy: consultantUser.id,
    },
  });

  console.log('Created sample venue:', venue1);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });