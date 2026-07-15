const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('Tables in public schema:', tables.map(t => t.tablename).join(', '));
  } catch (err) {
    console.error('Failed to query tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
