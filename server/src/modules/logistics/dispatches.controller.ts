import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateDispatchNo = (tenantId: string) => `DSP-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

export const getDispatches = async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (status) where.status = status;
  const dispatches = await prisma.dispatch.findMany({ where, include: { order: { include: { customer: true } }, transporter: true }, orderBy: { createdAt: 'desc' } });
  res.json(dispatches);
};

export const getDispatch = async (req: AuthRequest, res: Response) => {
  const dispatch = await prisma.dispatch.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { order: { include: { customer: true, items: { include: { item: true } } } }, transporter: true } });
  if (!dispatch) return res.status(404).json({ message: 'Dispatch not found' });
  res.json(dispatch);
};

export const createDispatch = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, transporterId, trackingNo, notes } = req.body;
    const order = await prisma.order.findFirst({ where: { id: orderId, tenantId: req.user!.tenantId } });
    if (!order) return res.status(400).json({ message: 'Order not found' });
    const transporter = await prisma.transporter.findFirst({ where: { id: transporterId, tenantId: req.user!.tenantId } });
    if (!transporter) return res.status(400).json({ message: 'Transporter not found' });
    const dispatch = await prisma.dispatch.create({
      data: { tenantId: req.user!.tenantId, dispatchNo: generateDispatchNo(req.user!.tenantId), orderId, transporterId, trackingNo, notes },
      include: { order: { include: { customer: true } }, transporter: true },
    });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });
    res.status(201).json(dispatch);
  } catch (err: unknown) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Error creating dispatch' });
  }
};

export const updateDispatch = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.dispatch.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!existing) return res.status(404).json({ message: 'Dispatch not found' });
  const { status, deliveryDate, trackingNo } = req.body;
  const dispatch = await prisma.dispatch.update({ where: { id: req.params.id }, data: { status, deliveryDate, trackingNo }, include: { transporter: true } });
  if (status === 'DELIVERED') await prisma.order.update({ where: { id: dispatch.orderId }, data: { status: 'DELIVERED' } });
  res.json(dispatch);
};
