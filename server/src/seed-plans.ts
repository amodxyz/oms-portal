import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: 'Starter',
    description: 'Suitable For: Small Businesses',
    price: 499,
    billingCycle: 'MONTHLY',
    features: JSON.stringify(['Up to 3 Users', 'Order Management', 'Customer Management', 'Product Management', 'Invoice Generation', 'Basic Reports', 'Email Support', '2 GB Cloud Storage']),
    isActive: true,
    isPopular: false,
    maxOrders: 100,
    maxUsers: 3,
    sortOrder: 1,
  },
  {
    name: 'Standard',
    description: 'Most Popular',
    price: 999,
    billingCycle: 'MONTHLY',
    features: JSON.stringify(['Everything in Starter', 'Up to 10 Users', 'Inventory Management', 'Purchase & Sales Orders', 'GST Billing', 'WhatsApp Notifications', 'Advanced Reports', 'Role-Based Access', '10 GB Cloud Storage', 'Priority Support']),
    isActive: true,
    isPopular: true,
    maxOrders: 1000,
    maxUsers: 10,
    sortOrder: 2,
  },
  {
    name: 'Professional',
    description: 'Suitable For: Manufacturers & Wholesalers',
    price: 1999,
    billingCycle: 'MONTHLY',
    features: JSON.stringify(['Everything in Standard', 'Up to 25 Users', 'BOM & Production Management', 'Supplier Management', 'Quality Control (QC)', 'Dispatch & Logistics Sync', 'Tally / ERP Integration', 'API Access', '50 GB Cloud Storage', 'Dedicated Account Manager']),
    isActive: true,
    isPopular: false,
    maxOrders: 5000,
    maxUsers: 25,
    sortOrder: 3,
  },
  {
    name: 'Enterprise',
    description: 'Suitable For: Large Enterprises',
    price: 4999,
    billingCycle: 'MONTHLY',
    features: JSON.stringify(['Everything in Professional', 'Unlimited Users', 'Multi-Warehouse Management', 'Custom Workflows', 'White-Label Portal', 'Custom Analytics & BI', 'SSO & Advanced Security', 'Unlimited Cloud Storage', '24/7 Phone & Email Support', 'On-Premise Deployment Option']),
    isActive: true,
    isPopular: false,
    maxOrders: 100000,
    maxUsers: 999,
    sortOrder: 4,
  }
];

async function main() {
  console.log('Seeding plans...');
  // Delete existing plans first to avoid duplicates or messy data
  await prisma.plan.deleteMany({});
  
  for (const plan of plans) {
    const p = await prisma.plan.create({
      data: plan
    });
    console.log(`Created plan: ${p.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
