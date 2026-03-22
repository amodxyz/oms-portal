import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getItems = async (req: AuthRequest, res: Response) => {
  const { search, categoryId, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (search) where.OR = [{ name: { contains: search } }, { code: { contains: search } }];
  if (categoryId) where.categoryId = categoryId;

  const [items, total] = await Promise.all([
    prisma.item.findMany({ where, include: { category: true }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.item.count({ where }),
  ]);
  res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
};

export const getItem = async (req: AuthRequest, res: Response) => {
  const item = await prisma.item.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { category: true, stockEntries: { orderBy: { createdAt: 'desc' }, take: 10 } } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.item.create({ data: { ...req.body, tenantId: req.user!.tenantId }, include: { category: true } });
    res.status(201).json(item);
  } catch {
    res.status(400).json({ message: 'Item code already exists' });
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.item.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Item not found' });
  const { name, description, categoryId, unit, costPrice, sellingPrice, minStock, isActive, rawMaterial, hsnCode, gstRate } = req.body;
  const item = await prisma.item.update({ where: { id: req.params.id }, data: { name, description, categoryId, unit, costPrice, sellingPrice, minStock, isActive, rawMaterial, hsnCode, gstRate }, include: { category: true } });
  res.json(item);
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.item.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Item not found' });
  await prisma.item.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Item deactivated' });
};

export const getRawMaterials = async (req: AuthRequest, res: Response) => {
  const items = await prisma.item.findMany({ where: { rawMaterial: true, isActive: true, tenantId: req.user!.tenantId }, include: { category: true } });
  res.json(items);
};
