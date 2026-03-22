import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getSuppliers = async (req: AuthRequest, res: Response) => {
  const { search } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (search) where.OR = [{ name: { contains: search } }, { code: { contains: search } }];
  const suppliers = await prisma.supplier.findMany({ where, include: { _count: { select: { purchaseOrders: true } } }, orderBy: { name: 'asc' } });
  res.json(suppliers);
};

export const getSupplier = async (req: AuthRequest, res: Response) => {
  const supplier = await prisma.supplier.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 } } });
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  res.json(supplier);
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await prisma.supplier.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json(supplier);
  } catch {
    res.status(400).json({ message: 'Supplier code already exists' });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.supplier.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Supplier not found' });
  const { name, email, phone, address, city, country } = req.body;
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: { name, email, phone, address, city, country } });
  res.json(supplier);
};

export const deleteSupplier = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.supplier.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Supplier not found' });
  await prisma.supplier.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Supplier deactivated' });
};
