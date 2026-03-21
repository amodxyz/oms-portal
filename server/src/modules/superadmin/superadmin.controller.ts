import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import { SuperAdminRequest } from '../../middleware/superadmin.middleware';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || process.env.JWT_SECRET!;

const audit = async (actor: string, action: string, entity: string, entityId?: string, details?: string, ip?: string) => {
  await prisma.auditLog.create({ data: { actor, action, entity, entityId, details, ip } }).catch(() => {});
};

// ── Auth ───────────────────────────────────────────────
export const superAdminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = await prisma.superAdmin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, email: admin.email, role: 'SUPER_ADMIN' }, SUPER_ADMIN_SECRET, { expiresIn: '8h' });
  await audit(admin.email, 'LOGIN', 'SuperAdmin', admin.id, undefined, req.ip);
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
};

export const getSuperAdminProfile = async (req: SuperAdminRequest, res: Response) => {
  const admin = await prisma.superAdmin.findUnique({ where: { id: req.superAdmin!.id }, select: { id: true, name: true, email: true, createdAt: true } });
  res.json(admin);
};

export const updateSuperAdminProfile = async (req: SuperAdminRequest, res: Response) => {
  const { name, password } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 12);
  const admin = await prisma.superAdmin.update({ where: { id: req.superAdmin!.id }, data, select: { id: true, name: true, email: true } });
  await audit(req.superAdmin!.email, 'UPDATE_PROFILE', 'SuperAdmin', admin.id);
  res.json(admin);
};

// ── Stats ──────────────────────────────────────────────
export const getStats = async (_req: SuperAdminRequest, res: Response) => {
  const [totalTenants, activeTenants, totalUsers, totalOrders, totalRevenue, recentTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.tenant.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { _count: { select: { users: true, orders: true } } } }),
  ]);
  res.json({
    totalTenants, activeTenants, suspendedTenants: totalTenants - activeTenants,
    totalUsers, totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentTenants,
  });
};

// ── Tenants ────────────────────────────────────────────
export const getTenants = async (_req: SuperAdminRequest, res: Response) => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true, orders: true } },
      subscriptions: { where: { status: 'ACTIVE' }, include: { plan: { select: { name: true, price: true } } }, take: 1 },
    },
  });
  res.json(tenants);
};

export const getTenantDetail = async (req: SuperAdminRequest, res: Response) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, isActive: true, emailVerified: true, createdAt: true } },
      _count: { select: { orders: true, items: true, customers: true, suppliers: true } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
};

export const setTenantStatus = async (req: SuperAdminRequest, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be boolean' });
  const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { isActive }, select: { id: true, name: true, isActive: true } });
  await audit(req.superAdmin!.email, isActive ? 'ACTIVATE_TENANT' : 'SUSPEND_TENANT', 'Tenant', tenant.id, tenant.name, req.ip);
  res.json(tenant);
};

export const deleteTenant = async (req: SuperAdminRequest, res: Response) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: req.params.id } });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  // Soft delete by deactivating
  await prisma.tenant.update({ where: { id: req.params.id }, data: { isActive: false } });
  await audit(req.superAdmin!.email, 'DELETE_TENANT', 'Tenant', req.params.id, tenant.name, req.ip);
  res.json({ message: 'Tenant deactivated' });
};

// ── Plans ──────────────────────────────────────────────
export const getPlans = async (_req: SuperAdminRequest, res: Response) => {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  });
  res.json(plans);
};

export const createPlan = async (req: SuperAdminRequest, res: Response) => {
  const { name, description, price, billingCycle, features, maxUsers, maxOrders, isActive, isPopular, sortOrder } = req.body;
  const plan = await prisma.plan.create({
    data: { name, description, price: Number(price), billingCycle, features: JSON.stringify(features), maxUsers: Number(maxUsers) || 5, maxOrders: Number(maxOrders) || 1000, isActive: isActive ?? true, isPopular: isPopular ?? false, sortOrder: Number(sortOrder) || 0 },
  });
  await audit(req.superAdmin!.email, 'CREATE_PLAN', 'Plan', plan.id, plan.name, req.ip);
  res.status(201).json(plan);
};

export const updatePlan = async (req: SuperAdminRequest, res: Response) => {
  const { name, description, price, billingCycle, features, maxUsers, maxOrders, isActive, isPopular, sortOrder } = req.body;
  const data: any = { name, description, billingCycle, isActive, isPopular };
  if (price !== undefined) data.price = Number(price);
  if (maxUsers !== undefined) data.maxUsers = Number(maxUsers);
  if (maxOrders !== undefined) data.maxOrders = Number(maxOrders);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (features !== undefined) data.features = JSON.stringify(features);
  const plan = await prisma.plan.update({ where: { id: req.params.id }, data });
  await audit(req.superAdmin!.email, 'UPDATE_PLAN', 'Plan', plan.id, plan.name, req.ip);
  res.json(plan);
};

export const deletePlan = async (req: SuperAdminRequest, res: Response) => {
  const subs = await prisma.subscription.count({ where: { planId: req.params.id, status: 'ACTIVE' } });
  if (subs > 0) return res.status(400).json({ message: `Cannot delete — ${subs} active subscription(s) on this plan` });
  await prisma.plan.delete({ where: { id: req.params.id } });
  await audit(req.superAdmin!.email, 'DELETE_PLAN', 'Plan', req.params.id, undefined, req.ip);
  res.json({ message: 'Plan deleted' });
};

// ── Coupons ────────────────────────────────────────────
export const getCoupons = async (_req: SuperAdminRequest, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(coupons);
};

export const createCoupon = async (req: SuperAdminRequest, res: Response) => {
  const { code, description, discountType, discountValue, maxUses, minAmount, validFrom, validUntil, isActive } = req.body;
  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return res.status(400).json({ message: 'Coupon code already exists' });
  const coupon = await prisma.coupon.create({
    data: { code: code.toUpperCase(), description, discountType, discountValue: Number(discountValue), maxUses: maxUses ? Number(maxUses) : null, minAmount: Number(minAmount) || 0, validFrom: validFrom ? new Date(validFrom) : new Date(), validUntil: validUntil ? new Date(validUntil) : null, isActive: isActive ?? true },
  });
  await audit(req.superAdmin!.email, 'CREATE_COUPON', 'Coupon', coupon.id, coupon.code, req.ip);
  res.status(201).json(coupon);
};

export const updateCoupon = async (req: SuperAdminRequest, res: Response) => {
  const { description, discountType, discountValue, maxUses, minAmount, validFrom, validUntil, isActive } = req.body;
  const data: any = { description, discountType, isActive };
  if (discountValue !== undefined) data.discountValue = Number(discountValue);
  if (maxUses !== undefined) data.maxUses = maxUses ? Number(maxUses) : null;
  if (minAmount !== undefined) data.minAmount = Number(minAmount);
  if (validFrom) data.validFrom = new Date(validFrom);
  if (validUntil) data.validUntil = new Date(validUntil);
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data });
  await audit(req.superAdmin!.email, 'UPDATE_COUPON', 'Coupon', coupon.id, coupon.code, req.ip);
  res.json(coupon);
};

export const deleteCoupon = async (req: SuperAdminRequest, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  await audit(req.superAdmin!.email, 'DELETE_COUPON', 'Coupon', req.params.id, undefined, req.ip);
  res.json({ message: 'Coupon deleted' });
};

export const validateCoupon = async (req: Request, res: Response) => {
  const { code, amount } = req.body;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) return res.status(404).json({ message: 'Invalid or inactive coupon' });
  if (coupon.validUntil && coupon.validUntil < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
  if (coupon.validFrom > new Date()) return res.status(400).json({ message: 'Coupon is not yet valid' });
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: 'Coupon usage limit reached' });
  if (amount && Number(amount) < coupon.minAmount) return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minAmount}` });
  const discount = coupon.discountType === 'PERCENT' ? (Number(amount) * coupon.discountValue) / 100 : coupon.discountValue;
  res.json({ valid: true, coupon, discount });
};

// ── Payment Gateways ───────────────────────────────────
export const getPaymentGateways = async (_req: SuperAdminRequest, res: Response) => {
  const gateways = await prisma.paymentGateway.findMany({ orderBy: { name: 'asc' } });
  // Mask sensitive keys
  const masked = gateways.map(g => {
    try {
      const config = JSON.parse(g.config);
      Object.keys(config).forEach(k => { if (k.toLowerCase().includes('secret') || k.toLowerCase().includes('key')) config[k] = config[k] ? '••••••••' + config[k].slice(-4) : ''; });
      return { ...g, config: JSON.stringify(config) };
    } catch { return g; }
  });
  res.json(masked);
};

export const upsertPaymentGateway = async (req: SuperAdminRequest, res: Response) => {
  const { name, displayName, isActive, isTestMode, config } = req.body;
  // Fetch existing to preserve masked keys
  const existing = await prisma.paymentGateway.findUnique({ where: { name } });
  let finalConfig = config;
  if (existing) {
    const existingConfig = JSON.parse(existing.config);
    const newConfig = typeof config === 'string' ? JSON.parse(config) : config;
    // Only update keys that are not masked
    Object.keys(newConfig).forEach(k => { if (newConfig[k] && !newConfig[k].startsWith('••••')) existingConfig[k] = newConfig[k]; });
    finalConfig = JSON.stringify(existingConfig);
  } else {
    finalConfig = typeof config === 'string' ? config : JSON.stringify(config);
  }
  const gateway = await prisma.paymentGateway.upsert({
    where: { name },
    update: { displayName, isActive, isTestMode, config: finalConfig },
    create: { name, displayName, isActive: isActive ?? false, isTestMode: isTestMode ?? true, config: finalConfig },
  });
  await audit(req.superAdmin!.email, 'UPDATE_PAYMENT_GATEWAY', 'PaymentGateway', gateway.id, name, req.ip);
  res.json({ ...gateway, config: '••• saved •••' });
};

// ── System Settings ────────────────────────────────────
export const getSettings = async (_req: SuperAdminRequest, res: Response) => {
  const settings = await prisma.systemSetting.findMany({ orderBy: { group: 'asc' } });
  // Group by key
  const grouped = settings.reduce((acc: any, s) => {
    if (!acc[s.group]) acc[s.group] = {};
    acc[s.group][s.key] = s.value;
    return acc;
  }, {});
  res.json(grouped);
};

export const updateSettings = async (req: SuperAdminRequest, res: Response) => {
  const { settings } = req.body; // { key: value, ... }
  const updates = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), group: req.body.group || 'general' } })
  );
  await Promise.all(updates);
  await audit(req.superAdmin!.email, 'UPDATE_SETTINGS', 'SystemSetting', undefined, Object.keys(settings).join(', '), req.ip);
  res.json({ message: 'Settings updated' });
};

// ── Audit Log ──────────────────────────────────────────
export const getAuditLogs = async (req: SuperAdminRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.auditLog.count(),
  ]);
  res.json({ logs, total, page, pages: Math.ceil(total / limit) });
};
