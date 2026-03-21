const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function wake(retries = 10) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempt ${i}/${retries} — connecting to Neon...`);
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database is awake and connected!');
      await prisma.$disconnect();
      return true;
    } catch (e) {
      console.log(`  ❌ Not ready yet: ${e.message}`);
      if (i < retries) {
        console.log(`  Waiting 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  console.log('❌ Could not connect after all retries.');
  await prisma.$disconnect();
  return false;
}

wake();
