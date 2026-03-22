import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generatePONo = (tenantId: string) => `PO-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

export const getPurchaseOrders = async (req: AuthRequest, res: Response) => {
  const { status, supplierId } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (status) where.status = status;
  if (supplierId) where.supplierId = supplierId;
  const orders = await prisma.purchaseOrder.findMany({ where, include: { supplier: true, items: { include: { item: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
};

export const getPurchaseOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.purchaseOrder.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { supplier: true, items: { include: { item: true } } } });
  if (!order) return res.status(404).json({ message: 'Purchase order not found' });
  res.json(order);
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  const { supplierId, expectedDate, notes, items } = req.body;

  // Verify supplier belongs to this tenant
  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, tenantId: req.user!.tenantId } });
  if (!supplier) return res.status(400).json({ message: 'Supplier not found' });

  // Verify all items belong to this tenant
  const itemIds = items.map((i: { itemId: string }) => i.itemId);
  const validItems = await prisma.item.findMany({ where: { id: { in: itemIds }, tenantId: req.user!.tenantId } });
  if (validItems.length !== itemIds.length) return res.status(400).json({ message: 'One or more items not found' });

  const totalAmount = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
  const order = await prisma.purchaseOrder.create({
    data: {
      tenantId: req.user!.tenantId,
      poNo: generatePONo(req.user!.tenantId),
      supplierId,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      notes,
      totalAmount,
      items: { create: items.map((i: { itemId: string; quantity: number; unitPrice: number }) => ({ itemId: i.itemId, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })) },
    },
    include: { supplier: true, items: { include: { item: true } } },
  });
  res.status(201).json(order);
};

export const updatePurchaseOrder = async (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body;
  const existing = await prisma.purchaseOrder.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Purchase order not found' });
  const order = await prisma.purchaseOrder.update({ where: { id: req.params.id }, data: { status, notes }, include: { supplier: true } });
  res.json(order);
};

export const deletePurchaseOrder = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.purchaseOrder.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Purchase order not found' });
  await prisma.purchaseItem.deleteMany({ where: { purchaseOrderId: req.params.id } });
  await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
  res.json({ message: 'Purchase order deleted' });
};
