#!/usr/bin/env ts-node

import { prisma } from '../src/server/lib/database';
import {
  testDatabaseConnection,
  getDatabaseHealth,
} from '../src/server/lib/db-test';

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Test connection
    console.log('1. Testing database connection...');
    const connected = await testDatabaseConnection();

    if (!connected) {
      console.log('❌ Database connection failed');
      process.exit(1);
    }

    // Check health
    console.log('2. Checking database health...');
    const health = await getDatabaseHealth();
    console.log(`   Status: ${health.status}`);

    if (health.status !== 'healthy') {
      console.log('❌ Database is not healthy');
      process.exit(1);
    }

    // Check tables exist
    console.log('3. Verifying database schema...');

    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    const expectedTables = [
      'users',
      'clients',
      'venues',
      'proposals',
      'proposal_venues',
      'bookings',
      'commission_claims',
    ];

    const tableNames = tables.map(t => t.tablename);
    const missingTables = expectedTables.filter(
      table => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('   Run: npm run db:migrate');
      process.exit(1);
    }

    console.log(`   ✅ All ${expectedTables.length} tables found`);

    // Check if seed data exists
    console.log('4. Checking seed data...');
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    const venueCount = await prisma.venue.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Clients: ${clientCount}`);
    console.log(`   Venues: ${venueCount}`);

    if (userCount === 0) {
      console.log('   ⚠️  No users found. Run: npm run db:seed');
    }

    console.log('\n✅ Database setup verification completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   - Connection: ✅ Working`);
    console.log(`   - Schema: ✅ ${expectedTables.length} tables`);
    console.log(
      `   - Data: ${userCount} users, ${clientCount} clients, ${venueCount} venues`
    );
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyDatabase();
}

export { verifyDatabase };
