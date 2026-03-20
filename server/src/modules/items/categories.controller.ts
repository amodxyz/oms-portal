import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getCategories = async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({ where: { tenantId: req.user!.tenantId }, include: { _count: { select: { items: true } } }, orderBy: { name: 'asc' } });
  res.json(categories);
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json(category);
  } catch {
    res.status(400).json({ message: 'Category already exists' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json(category);
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted' });
};
