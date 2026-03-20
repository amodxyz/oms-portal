import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getInventoryReport = async (req: AuthRequest, res: Response) => {
  const items = await prisma.item.findMany({ where: { isActive: true, tenantId: req.user!.tenantId }, include: { category: true, stockEntries: true } });
  const report = items.map(item => {
    const stock = item.stockEntries.reduce((sum, e) => e.type === 'IN' ? sum + e.quantity : sum - e.quantity, 0);
    return { id: item.id, code: item.code, name: item.name, category: item.category.name, unit: item.unit, stock, minStock: item.minStock, costPrice: item.costPrice, sellingPrice: item.sellingPrice, stockValue: stock * item.costPrice, status: stock <= item.minStock ? 'LOW' : 'OK' };
  });
  res.json({ report, generatedAt: new Date() });
};

export const getDayBook = async (req: AuthRequest, res: Response) => {
  const { date } = req.query as Record<string, string>;
  const tenantId = req.user!.tenantId;
  const start = date ? new Date(date) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const [orders, purchaseOrders, stockEntries] = await Promise.all([
    prisma.order.findMany({ where: { tenantId, createdAt: { gte: start, lte: end } }, include: { customer: true } }),
    prisma.purchaseOrder.findMany({ where: { tenantId, createdAt: { gte: start, lte: end } }, include: { supplier: true } }),
    prisma.stock.findMany({ where: { createdAt: { gte: start, lte: end }, item: { tenantId } }, include: { item: true } }),
  ]);

  res.json({ date: start, orders, purchaseOrders, stockEntries, summary: { totalSales: orders.reduce((s, o) => s + o.totalAmount, 0), totalPurchases: purchaseOrders.reduce((s, p) => s + p.totalAmount, 0) } });
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const [totalOrders, totalCustomers, totalItems, totalSuppliers, recentOrders, lowStockItems, pendingInspections] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.customer.count({ where: { isActive: true, tenantId } }),
    prisma.item.count({ where: { isActive: true, tenantId } }),
    prisma.supplier.count({ where: { isActive: true, tenantId } }),
    prisma.order.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
    prisma.item.findMany({ where: { isActive: true, tenantId }, include: { stockEntries: true } }),
    prisma.inspection.count({ where: { status: 'PENDING', tenantId } }),
  ]);

  const revenue = await prisma.order.aggregate({ where: { tenantId }, _sum: { totalAmount: true } });
  const lowStock = lowStockItems.filter(item => {
    const stock = item.stockEntries.reduce((sum, e) => e.type === 'IN' ? sum + e.quantity : sum - e.quantity, 0);
    return stock <= item.minStock;
  }).length;

  res.json({ totalOrders, totalCustomers, totalItems, totalSuppliers, totalRevenue: revenue._sum.totalAmount || 0, recentOrders, lowStockCount: lowStock, pendingInspections });
};
