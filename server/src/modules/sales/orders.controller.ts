import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateOrderNo = (tenantId: string) => `ORD-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

export const getOrders = async (req: AuthRequest, res: Response) => {
  const { search, status, customerId, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (search) where.OR = [{ orderNo: { contains: search } }, { customer: { name: { contains: search } } }];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: { customer: true, items: { include: { item: true } } }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { customer: true, items: { include: { item: true } }, invoice: true, dispatch: { include: { transporter: true } } } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { customerId, dueDate, discount, tax, notes, items } = req.body;
  const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
  const totalAmount = subtotal - (discount || 0) + (tax || 0);

  const order = await prisma.order.create({
    data: { tenantId: req.user!.tenantId, orderNo: generateOrderNo(req.user!.tenantId), customerId, dueDate, discount, tax, notes, totalAmount, items: { create: items.map((i: { itemId: string; quantity: number; unitPrice: number }) => ({ ...i, total: i.quantity * i.unitPrice })) } },
    include: { customer: true, items: { include: { item: true } } },
  });
  res.status(201).json(order);
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  const { status, notes, dueDate } = req.body;
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status, notes, dueDate }, include: { customer: true } });
  res.json(order);
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
  await prisma.order.delete({ where: { id: req.params.id } });
  res.json({ message: 'Order deleted' });
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const [totalOrders, totalRevenue, statusCounts, recentOrders] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.order.aggregate({ where: { tenantId }, _sum: { totalAmount: true } }),
    prisma.order.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
    prisma.order.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
  ]);
  res.json({ totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, statusCounts, recentOrders });
};
