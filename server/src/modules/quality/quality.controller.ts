import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateRefNo = (tenantId: string) => `QC-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

export const getInspections = async (req: AuthRequest, res: Response) => {
  const { status, type } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
  if (status) where.status = status;
  if (type) where.type = type;
  const inspections = await prisma.inspection.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(inspections);
};

export const getInspection = async (req: AuthRequest, res: Response) => {
  const inspection = await prisma.inspection.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { items: true } });
  if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
  res.json(inspection);
};

export const createInspection = async (req: AuthRequest, res: Response) => {
  const { type, referenceId, inspector, date, notes, items } = req.body;
  const inspection = await prisma.inspection.create({
    data: { tenantId: req.user!.tenantId, refNo: generateRefNo(req.user!.tenantId), type, referenceId, inspector, date, notes, items: { create: items || [] } },
    include: { items: true },
  });
  res.status(201).json(inspection);
};

export const updateInspection = async (req: AuthRequest, res: Response) => {
  const { status, notes, items } = req.body;
  if (items) {
    await prisma.inspectionItem.deleteMany({ where: { inspectionId: req.params.id } });
    await prisma.inspectionItem.createMany({ data: items.map((i: Record<string, unknown>) => ({ ...i, inspectionId: req.params.id })) });
  }
  const inspection = await prisma.inspection.update({ where: { id: req.params.id }, data: { status, notes }, include: { items: true } });
  res.json(inspection);
};

export const deleteInspection = async (req: AuthRequest, res: Response) => {
  await prisma.inspectionItem.deleteMany({ where: { inspectionId: req.params.id } });
  await prisma.inspection.delete({ where: { id: req.params.id } });
  res.json({ message: 'Inspection deleted' });
};
