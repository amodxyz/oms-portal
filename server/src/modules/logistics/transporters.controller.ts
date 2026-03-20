import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getTransporters = async (req: AuthRequest, res: Response) => {
  const transporters = await prisma.transporter.findMany({ where: { tenantId: req.user!.tenantId }, include: { _count: { select: { dispatches: true } } }, orderBy: { name: 'asc' } });
  res.json(transporters);
};

export const createTransporter = async (req: AuthRequest, res: Response) => {
  try {
    const transporter = await prisma.transporter.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json(transporter);
  } catch {
    res.status(400).json({ message: 'Transporter code already exists' });
  }
};

export const updateTransporter = async (req: AuthRequest, res: Response) => {
  const transporter = await prisma.transporter.update({ where: { id: req.params.id }, data: req.body });
  res.json(transporter);
};
