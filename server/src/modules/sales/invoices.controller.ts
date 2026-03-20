import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateInvoiceNo = () => `INV-${Date.now()}`;

export const getInvoices = async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { order: { tenantId: req.user!.tenantId } };
  if (status) where.status = status;
  const invoices = await prisma.invoice.findMany({ where, include: { order: { include: { customer: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(invoices);
};

export const getInvoice = async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, order: { tenantId: req.user!.tenantId } }, include: { order: { include: { customer: true, items: { include: { item: true } } } } } });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  const { orderId, dueDate } = req.body;
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId: req.user!.tenantId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const invoice = await prisma.invoice.create({ data: { invoiceNo: generateInvoiceNo(), orderId, dueDate, amount: order.totalAmount }, include: { order: { include: { customer: true } } } });
  res.status(201).json(invoice);
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  const { paid, status } = req.body;
  const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: { paid, status } });
  res.json(invoice);
};
