import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateOrderNo = (tenantId: string) => `PROD-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

export const getProductionOrders = async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (status) where.status = status;
  const orders = await prisma.productionOrder.findMany({ where, include: { resources: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
};

export const getProductionOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.productionOrder.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { resources: true } });
  if (!order) return res.status(404).json({ message: 'Production order not found' });
  res.json(order);
};

export const createProductionOrder = async (req: AuthRequest, res: Response) => {
  const { productName, quantity, unit, startDate, endDate, priority, assignedTo, notes, resources } = req.body;
  const order = await prisma.productionOrder.create({
    data: { tenantId: req.user!.tenantId, orderNo: generateOrderNo(req.user!.tenantId), productName, quantity, unit, startDate, endDate, priority, assignedTo, notes, resources: { create: resources || [] } },
    include: { resources: true },
  });
  res.status(201).json(order);
};

export const updateProductionOrder = async (req: AuthRequest, res: Response) => {
  const { status, endDate, notes } = req.body;
  const order = await prisma.productionOrder.update({ where: { id: req.params.id }, data: { status, endDate, notes }, include: { resources: true } });
  res.json(order);
};

export const deleteProductionOrder = async (req: AuthRequest, res: Response) => {
  await prisma.productionResource.deleteMany({ where: { productionOrderId: req.params.id } });
  await prisma.productionOrder.delete({ where: { id: req.params.id } });
  res.json({ message: 'Production order deleted' });
};
