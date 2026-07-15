import { Router } from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './employees.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';

const router = Router();

// Only ADMIN should be able to manage employees
router.use(authenticate, authorize(['ADMIN']));

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
