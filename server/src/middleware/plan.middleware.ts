import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './auth.middleware';
import logger from '../utils/logger';

/**
 * Middleware to check if a tenant has reached their plan limits (Users/Orders).
 * @param type 'USERS' or 'ORDERS'
 */
export const checkPlanLimit = (type: 'USERS' | 'ORDERS') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ message: 'Authentication required' });

    try {
      // 1. Get the active subscription and plan
      const subscription = await prisma.subscription.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: { plan: true },
      });

      if (!subscription) {
        return res.status(403).json({ message: 'No active subscription found. Please subscribe to a plan.' });
      }

      const plan = subscription.plan;

      if (type === 'USERS') {
        // 2. Count current active users
        const userCount = await prisma.user.count({ where: { tenantId, isActive: true } });
        if (userCount >= plan.maxUsers) {
          return res.status(403).json({ 
            message: `User limit reached (${plan.maxUsers}). Please upgrade your plan to add more users.`,
            limitReached: true 
          });
        }
      }

      if (type === 'ORDERS') {
        // 3. Count orders created in the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const orderCount = await prisma.order.count({ 
          where: { 
            tenantId, 
            createdAt: { gte: startOfMonth } 
          } 
        });

        if (orderCount >= plan.maxOrders) {
          return res.status(403).json({ 
            message: `Monthly order limit reached (${plan.maxOrders}). Please upgrade your plan to process more orders.`,
            limitReached: true 
          });
        }
      }

      next();
    } catch (error: any) {
      logger.error(`Plan Limit Middleware Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error while checking plan limits' });
    }
  };
};
