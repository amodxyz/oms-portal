import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Billing plans
  const plans = [
    { name: 'Starter', description: 'For small teams getting started', price: 29, billingCycle: 'MONTHLY', features: JSON.stringify(['Up to 5 users', '1,000 orders/month', 'Basic reports', 'Email support']) },
    { name: 'Professional', description: 'For growing businesses', price: 79, billingCycle: 'MONTHLY', features: JSON.stringify(['Up to 20 users', '10,000 orders/month', 'Advanced analytics', 'Priority support', 'API access', 'CSV exports']) },
    { name: 'Enterprise', description: 'For large-scale operations', price: 199, billingCycle: 'MONTHLY', features: JSON.stringify(['Unlimited users', 'Unlimited orders', 'Custom reports', '24/7 dedicated support', 'Full API access', 'Custom integrations', 'SLA guarantee']) },
    { name: 'Starter Annual', description: 'Starter plan billed yearly (save 20%)', price: 279, billingCycle: 'YEARLY', features: JSON.stringify(['Up to 5 users', '1,000 orders/month', 'Basic reports', 'Email support']) },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) await prisma.plan.create({ data: plan });
  }
  console.log('✅ Billing plans seeded');

  // Super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@oms.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'changeme_immediately';

  const existing = await prisma.superAdmin.findUnique({ where: { email: superAdminEmail } });
  if (!existing) {
    await prisma.superAdmin.create({
      data: {
        email: superAdminEmail,
        password: await bcrypt.hash(superAdminPassword, 12),
        name: 'Super Admin',
      },
    });
    console.log(`✅ Super admin created: ${superAdminEmail}`);
    if (superAdminPassword === 'changeme_immediately') {
      console.log('⚠️  WARNING: Using default password. Set SUPER_ADMIN_PASSWORD env var before running seed in production.');
    }
  } else {
    console.log(`ℹ️  Super admin already exists: ${superAdminEmail}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
