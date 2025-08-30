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

  const client2 = await prisma.client.create({
    data: {
      name: 'Tech Startup Inc',
      company: 'Tech Startup Inc',
      contactName: 'Jane Doe',
      email: 'jane.doe@techstartup.com',
      phone: '+1-555-0789',
      notes: 'Growing startup, budget-conscious but values modern facilities',
      createdBy: consultantUser.id,
    },
  });

  console.log('Created sample clients:', { client1, client2 });

  // Create sample venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Grand Hotel Conference Center',
      location: 'Downtown, City Center',
      contactName: 'Sarah Johnson',
      email: 'events@grandhotel.com',
      phone: '+1-555-0456',
      standardCommission: 10.0,
      notes: 'Premium venue with excellent AV facilities',
      createdBy: consultantUser.id,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Modern Business Hub',
      location: 'Business District',
      contactName: 'Mike Wilson',
      email: 'bookings@modernhub.com',
      phone: '+1-555-0321',
      standardCommission: 8.5,
      notes: 'Contemporary venue with state-of-the-art technology',
      createdBy: consultantUser.id,
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Riverside Event Space',
      location: 'Waterfront District',
      contactName: 'Lisa Chen',
      email: 'events@riverside.com',
      phone: '+1-555-0654',
      standardCommission: 12.0,
      notes: 'Scenic venue with outdoor options and waterfront views',
      createdBy: consultantUser.id,
    },
  });

  console.log('Created sample venues:', { venue1, venue2, venue3 });

  // Create a sample proposal
  const proposal1 = await prisma.proposal.create({
    data: {
      clientId: client1.id,
      createdBy: consultantUser.id,
      status: 'draft',
      totalValue: 15000.0,
      expectedCommission: 1500.0,
      notes: 'Annual company conference proposal',
    },
  });

  // Create proposal venues with charge lines
  const proposalVenue1 = await prisma.proposalVenue.create({
    data: {
      proposalId: proposal1.id,
      venueId: venue1.id,
      chargeLines: [
        {
          id: '1',
          description: 'Main conference room rental',
          quantity: 2,
          unitPrice: 2500.0,
          total: 5000.0,
          category: 'room_hire',
        },
        {
          id: '2',
          description: 'Lunch catering for 100 people',
          quantity: 100,
          unitPrice: 45.0,
          total: 4500.0,
          category: 'food_beverage',
        },
        {
          id: '3',
          description: 'AV equipment package',
          quantity: 1,
          unitPrice: 1200.0,
          total: 1200.0,
          category: 'av_equipment',
        },
      ],
      notes: 'Preferred venue option with full service package',
    },
  });

  console.log('Created sample proposal and proposal venue:', {
    proposal1,
    proposalVenue1,
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
