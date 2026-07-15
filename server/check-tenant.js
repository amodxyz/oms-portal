const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenant() {
  try {
    const tenant = await prisma.tenant.findFirst();
    console.log("Successfully ran findFirst on Tenant. Result:", tenant);
  } catch (error) {
    console.error("Error running findFirst on Tenant:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenant();
