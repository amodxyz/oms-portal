import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  const { search } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }, { code: { contains: search } }];
  const customers = await prisma.customer.findMany({ where, include: { _count: { select: { orders: true } } }, orderBy: { name: 'asc' } });
  res.json(customers);
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { orders: { orderBy: { createdAt: 'desc' }, take: 10 } } });
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json(customer);
  } catch {
    res.status(400).json({ message: 'Customer code already exists' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.customer.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Customer not found' });
  const { name, email, phone, address, city, state, country, gstin } = req.body;
  const customer = await prisma.customer.update({ where: { id: req.params.id }, data: { name, email, phone, address, city, state, country, gstin } });
  res.json(customer);
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.customer.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Customer not found' });
  await prisma.customer.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Customer deactivated' });
};
