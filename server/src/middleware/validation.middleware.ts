import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array().map(e => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg })) });
  }
  next();
};

export const registerRules = [
  body('orgName').trim().notEmpty().withMessage('Organisation name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim(),
  body('gstin').optional().trim().isLength({ max: 20 }),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createUserRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['ADMIN', 'MANAGER', 'STAFF']).withMessage('Invalid role'),
];

export const createOrderRules = [
  body('customerId').notEmpty().withMessage('Customer is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
  body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unitPrice').isFloat({ gt: 0 }).withMessage('Unit price must be greater than 0'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be non-negative'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax must be non-negative'),
];

export const createItemRules = [
  body('code').trim().notEmpty().withMessage('Item code is required'),
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('costPrice').isFloat({ gt: 0 }).withMessage('Cost price must be greater than 0'),
  body('sellingPrice').isFloat({ gt: 0 }).withMessage('Selling price must be greater than 0'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be non-negative'),
];

export const createCustomerRules = [
  body('code').trim().notEmpty().withMessage('Customer code is required'),
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
];

export const createSupplierRules = [
  body('code').trim().notEmpty().withMessage('Supplier code is required'),
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
];

export const createPurchaseOrderRules = [
  body('supplierId').notEmpty().withMessage('Supplier is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
  body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unitPrice').isFloat({ gt: 0 }).withMessage('Unit price must be greater than 0'),
];

export const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

export const resetPasswordRules = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];
