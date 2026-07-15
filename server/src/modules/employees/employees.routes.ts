import { Router } from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './employees.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Only ADMIN should be able to manage employees
router.use(authenticate as any, authorize('ADMIN') as any);

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
