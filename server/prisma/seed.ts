import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: { name: 'Demo Organisation', slug: 'demo-org', email: 'admin@oms.com', phone: '+91 98765 43210', gstin: '27AAPFU0939F1ZV' },
  });

  // Seed users
  const users = [
    { name: 'Admin User', email: 'admin@oms.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Manager User', email: 'manager@oms.com', password: 'manager123', role: 'MANAGER' },
    { name: 'Staff User', email: 'staff@oms.com', password: 'staff123', role: 'STAFF' },
  ];

  for (const user of users) {
    const existing = await prisma.user.findFirst({ where: { tenantId: tenant.id, email: user.email } });
    if (!existing) {
      await prisma.user.create({ data: { tenantId: tenant.id, ...user, password: await bcrypt.hash(user.password, 10) } });
    }
  }

  // Seed categories
  const categoryNames = ['Electronics', 'Raw Materials', 'Finished Goods', 'Packaging', 'Spare Parts'];
  const createdCategories: Record<string, string> = {};
  for (const name of categoryNames) {
    const existing = await prisma.category.findFirst({ where: { tenantId: tenant.id, name } });
    const cat = existing ?? await prisma.category.create({ data: { tenantId: tenant.id, name } });
    createdCategories[name] = cat.id;
  }

  // Seed items
  const items = [
    { code: 'ITM001', name: 'Steel Rod', unit: 'kg', costPrice: 50, sellingPrice: 75, categoryId: createdCategories['Raw Materials'], rawMaterial: true },
    { code: 'ITM002', name: 'Circuit Board', unit: 'pcs', costPrice: 200, sellingPrice: 350, categoryId: createdCategories['Electronics'] },
    { code: 'ITM003', name: 'Cardboard Box', unit: 'pcs', costPrice: 10, sellingPrice: 20, categoryId: createdCategories['Packaging'] },
    { code: 'ITM004', name: 'Assembled Unit', unit: 'pcs', costPrice: 500, sellingPrice: 800, categoryId: createdCategories['Finished Goods'] },
  ];

  for (const item of items) {
    const existing = await prisma.item.findFirst({ where: { tenantId: tenant.id, code: item.code } });
    if (!existing) await prisma.item.create({ data: { tenantId: tenant.id, ...item, minStock: 10 } });
  }

  // Seed customers
  const customers = [
    { code: 'CUST001', name: 'Acme Corp', email: 'acme@example.com', phone: '+91 98001 00001', city: 'Mumbai', country: 'India' },
    { code: 'CUST002', name: 'Global Tech', email: 'global@example.com', phone: '+91 98001 00002', city: 'Bengaluru', country: 'India' },
  ];
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { tenantId: tenant.id, code: c.code } });
    if (!existing) await prisma.customer.create({ data: { tenantId: tenant.id, ...c } });
  }

  // Seed suppliers
  const suppliers = [
    { code: 'SUP001', name: 'Steel Works Ltd', email: 'steel@example.com', phone: '+91 98002 00001', city: 'Pune', country: 'India' },
    { code: 'SUP002', name: 'Tech Components Inc', email: 'tech@example.com', phone: '+91 98002 00002', city: 'Chennai', country: 'India' },
  ];
  for (const s of suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { tenantId: tenant.id, code: s.code } });
    if (!existing) await prisma.supplier.create({ data: { tenantId: tenant.id, ...s } });
  }

  // Seed transporter
  const existingTrp = await prisma.transporter.findFirst({ where: { tenantId: tenant.id, code: 'TRP001' } });
  if (!existingTrp) await prisma.transporter.create({ data: { tenantId: tenant.id, code: 'TRP001', name: 'FastShip Logistics', phone: '+91 99887 76655', vehicle: 'Truck' } });

  // Seed plans
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

  console.log('✅ Database seeded successfully');
  console.log(`   Tenant: ${tenant.name} (${tenant.slug})`);
  console.log('   Users: admin@oms.com / manager@oms.com / staff@oms.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
