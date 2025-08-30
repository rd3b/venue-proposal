import { prisma } from './database';

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as health`;
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      result,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run connection test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
