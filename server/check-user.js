const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Successfully ran findFirst. Result:", user);
  } catch (error) {
    console.error("Error running findFirst:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
