import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import { SuperAdminRequest } from '../../middleware/superadmin.middleware';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || process.env.JWT_SECRET!;

export const superAdminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = await prisma.superAdmin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'SUPER_ADMIN' },
    SUPER_ADMIN_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
};

export const getStats = async (_req: SuperAdminRequest, res: Response) => {
  const [totalTenants, activeTenants, totalUsers, totalOrders] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
  ]);
  res.json({ totalTenants, activeTenants, suspendedTenants: totalTenants - activeTenants, totalUsers, totalOrders });
};

export const getTenants = async (_req: SuperAdminRequest, res: Response) => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true, orders: true } },
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: { select: { name: true } } },
        take: 1,
      },
    },
  });
  res.json(tenants);
};

export const getTenantDetail = async (req: SuperAdminRequest, res: Response) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true, emailVerified: true, createdAt: true },
      },
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
  const tenant = await prisma.tenant.update({
    where: { id: req.params.id },
    data: { isActive },
    select: { id: true, name: true, isActive: true },
  });
  res.json(tenant);
};

export const getSuperAdminProfile = async (req: SuperAdminRequest, res: Response) => {
  const admin = await prisma.superAdmin.findUnique({
    where: { id: req.superAdmin!.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  res.json(admin);
};
