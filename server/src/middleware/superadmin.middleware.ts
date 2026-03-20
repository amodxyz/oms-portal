import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface SuperAdminRequest extends Request {
  superAdmin?: { id: string; email: string; role: string };
}

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || process.env.JWT_SECRET!;

export const authenticateSuperAdmin = (req: SuperAdminRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SUPER_ADMIN_SECRET) as { id: string; email: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ message: 'Access denied' });
    req.superAdmin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
