import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getInventoryReport, getDayBook, getDashboard } from './reports.controller';

const router = Router();
router.use(authenticate);

router.get('/inventory', getInventoryReport);
router.get('/daybook', getDayBook);
router.get('/dashboard', getDashboard);

export default router;
