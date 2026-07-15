const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { tenant: true } });
  console.log("USERS:");
  users.forEach(u => {
    console.log(`User ${u.email}: user.isActive=${u.isActive}, tenant.isActive=${u.tenant ? u.tenant.isActive : 'NULL_TENANT'}`);
  });

  const tenants = await prisma.tenant.findMany();
  console.log("\nTENANTS:");
  tenants.forEach(t => {
    console.log(`Tenant ${t.email} (${t.slug}): isActive=${t.isActive}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
