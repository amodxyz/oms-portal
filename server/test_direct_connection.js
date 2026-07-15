const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_Do9L8QgPCdGe@ep-patient-unit-amihjw3n.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require",
    },
  },
});

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Direct connection successful!");
  } catch(e) {
    console.error("Direct connection failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
