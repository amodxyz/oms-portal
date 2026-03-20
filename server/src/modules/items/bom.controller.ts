import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getBOMs = async (req: AuthRequest, res: Response) => {
  const boms = await prisma.bOM.findMany({ where: { tenantId: req.user!.tenantId }, include: { items: { include: { parent: true, component: true } } } });
  res.json(boms);
};

export const getBOM = async (req: AuthRequest, res: Response) => {
  const bom = await prisma.bOM.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId }, include: { items: { include: { parent: true, component: true } } } });
  if (!bom) return res.status(404).json({ message: 'BOM not found' });
  res.json(bom);
};

export const createBOM = async (req: AuthRequest, res: Response) => {
  const { name, description, items } = req.body;
  const bom = await prisma.bOM.create({
    data: { tenantId: req.user!.tenantId, name, description, items: { create: items } },
    include: { items: { include: { parent: true, component: true } } },
  });
  res.status(201).json(bom);
};

export const updateBOM = async (req: AuthRequest, res: Response) => {
  const { name, description, items } = req.body;
  await prisma.bOMItem.deleteMany({ where: { bomId: req.params.id } });
  const bom = await prisma.bOM.update({
    where: { id: req.params.id },
    data: { name, description, items: { create: items } },
    include: { items: { include: { parent: true, component: true } } },
  });
  res.json(bom);
};

export const deleteBOM = async (req: AuthRequest, res: Response) => {
  await prisma.bOMItem.deleteMany({ where: { bomId: req.params.id } });
  await prisma.bOM.delete({ where: { id: req.params.id } });
  res.json({ message: 'BOM deleted' });
};
