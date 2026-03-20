import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getItemStock = async (req: AuthRequest, res: Response) => {
  const item = await prisma.item.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const entries = await prisma.stock.findMany({ where: { itemId: req.params.id }, orderBy: { createdAt: 'desc' } });
  const quantity = entries.reduce((sum, e) => e.type === 'IN' ? sum + e.quantity : sum - e.quantity, 0);
  res.json({ entries, currentStock: quantity });
};

export const createStockEntry = async (req: AuthRequest, res: Response) => {
  const item = await prisma.item.findFirst({ where: { id: req.body.itemId, tenantId: req.user!.tenantId } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const entry = await prisma.stock.create({ data: req.body });
  res.status(201).json(entry);
};

export const getStockSummary = async (req: AuthRequest, res: Response) => {
  const items = await prisma.item.findMany({ where: { isActive: true, tenantId: req.user!.tenantId }, include: { category: true, stockEntries: true } });
  const summary = items.map(item => {
    const stock = item.stockEntries.reduce((sum, e) => e.type === 'IN' ? sum + e.quantity : sum - e.quantity, 0);
    return { id: item.id, code: item.code, name: item.name, category: item.category.name, unit: item.unit, stock, minStock: item.minStock, status: stock <= item.minStock ? 'LOW' : 'OK' };
  });
  res.json(summary);
};
