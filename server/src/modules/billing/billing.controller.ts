import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateInvoiceNo = () => `BILL-${Date.now()}`;

export const getPlans = async (_req: AuthRequest, res: Response) => {
  const plans = await prisma.plan.findMany({ include: { _count: { select: { subscriptions: true } } }, orderBy: { price: 'asc' } });
  res.json(plans.map(p => ({ ...p, features: JSON.parse(p.features) })));
};

export const createPlan = async (req: AuthRequest, res: Response) => {
  const { name, description, price, billingCycle, features } = req.body;
  const plan = await prisma.plan.create({ data: { name, description, price, billingCycle, features: JSON.stringify(features) } });
  res.status(201).json({ ...plan, features: JSON.parse(plan.features) });
};

export const updatePlan = async (req: AuthRequest, res: Response) => {
  const { name, description, price, billingCycle, features, isActive } = req.body;
  const data: Record<string, unknown> = { name, description, price, billingCycle, isActive };
  if (features) data.features = JSON.stringify(features);
  const plan = await prisma.plan.update({ where: { id: req.params.id }, data });
  res.json({ ...plan, features: JSON.parse(plan.features) });
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
  await prisma.plan.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Plan deactivated' });
};

export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  const subs = await prisma.subscription.findMany({
    where: { tenantId: req.user!.tenantId },
    include: { plan: true, billingRecords: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(subs);
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  const sub = await prisma.subscription.findFirst({
    where: { id: req.params.id, tenantId: req.user!.tenantId },
    include: { plan: true, billingRecords: { orderBy: { createdAt: 'desc' } } },
  });
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json({ ...sub, plan: { ...sub.plan, features: JSON.parse(sub.plan.features) } });
};

export const createSubscription = async (req: AuthRequest, res: Response) => {
  const { planId, autoRenew } = req.body;
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return res.status(404).json({ message: 'Plan not found' });

  const endDate = new Date();
  if (plan.billingCycle === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
  else if (plan.billingCycle === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);

  const sub = await prisma.subscription.create({
    data: { tenantId: req.user!.tenantId, planId, autoRenew: autoRenew ?? true, endDate },
    include: { plan: true },
  });

  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 7);
  const cgst = +(plan.price * 0.09).toFixed(2);
  const sgst = +(plan.price * 0.09).toFixed(2);
  const tax = cgst + sgst;
  await prisma.billingRecord.create({
    data: { subscriptionId: sub.id, invoiceNo: generateInvoiceNo(), amount: plan.price, tax, total: plan.price + tax, dueDate },
  });

  res.status(201).json({ ...sub, plan: { ...sub.plan, features: JSON.parse(sub.plan.features) } });
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  const { status, autoRenew } = req.body;
  const sub = await prisma.subscription.update({ where: { id: req.params.id }, data: { status, autoRenew }, include: { plan: true } });
  res.json(sub);
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  const sub = await prisma.subscription.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', autoRenew: false, endDate: new Date() } });
  res.json(sub);
};

export const getBillingRecords = async (req: AuthRequest, res: Response) => {
  const { status, subscriptionId } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { subscription: { tenantId: req.user!.tenantId } };
  if (status) where.status = status;
  if (subscriptionId) where.subscriptionId = subscriptionId;
  const records = await prisma.billingRecord.findMany({ where, include: { subscription: { include: { plan: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(records);
};

export const payBillingRecord = async (req: AuthRequest, res: Response) => {
  const { paymentMethod } = req.body;
  const record = await prisma.billingRecord.update({
    where: { id: req.params.id },
    data: { status: 'PAID', paidDate: new Date(), paymentMethod },
    include: { subscription: { include: { plan: true } } },
  });

  if (record.subscription.autoRenew && record.subscription.status === 'ACTIVE') {
    const plan = record.subscription.plan;
    const dueDate = new Date();
    if (plan.billingCycle === 'MONTHLY') dueDate.setMonth(dueDate.getMonth() + 1);
    else dueDate.setFullYear(dueDate.getFullYear() + 1);
    const tax = +(plan.price * 0.18).toFixed(2);
    await prisma.billingRecord.create({
      data: { subscriptionId: record.subscriptionId, invoiceNo: generateInvoiceNo(), amount: plan.price, tax, total: plan.price + tax, dueDate },
    });
  }
  res.json(record);
};

export const getBillingSummary = async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const [totalRevenue, unpaidCount, activeSubscriptions, records] = await Promise.all([
    prisma.billingRecord.aggregate({ where: { status: 'PAID', subscription: { tenantId } }, _sum: { total: true } }),
    prisma.billingRecord.count({ where: { status: 'UNPAID', subscription: { tenantId } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', tenantId } }),
    prisma.billingRecord.findMany({ where: { subscription: { tenantId } }, orderBy: { createdAt: 'desc' }, take: 6, include: { subscription: { include: { plan: true } } } }),
  ]);
  res.json({ totalRevenue: totalRevenue._sum.total || 0, unpaidCount, activeSubscriptions, recentRecords: records });
};
