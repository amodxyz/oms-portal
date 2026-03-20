import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: 'Starter', description: 'For small teams getting started', price: 29, billingCycle: 'MONTHLY', features: JSON.stringify(['Up to 5 users', '1,000 orders/month', 'Basic reports', 'Email support']) },
    { name: 'Professional', description: 'For growing businesses', price: 79, billingCycle: 'MONTHLY', features: JSON.stringify(['Up to 20 users', '10,000 orders/month', 'Advanced analytics', 'Priority support', 'API access', 'CSV exports']) },
    { name: 'Enterprise', description: 'For large-scale operations', price: 199, billingCycle: 'MONTHLY', features: JSON.stringify(['Unlimited users', 'Unlimited orders', 'Custom reports', '24/7 dedicated support', 'Full API access', 'Custom integrations', 'SLA guarantee']) },
    { name: 'Starter Annual', description: 'Starter plan billed yearly (save 20%)', price: 279, billingCycle: 'YEARLY', features: JSON.stringify(['Up to 5 users', '1,000 orders/month', 'Basic reports', 'Email support']) },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({ where: { name: plan.name }, update: plan, create: plan });
  }

  console.log('✅ Billing plans seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
