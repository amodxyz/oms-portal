import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getInspections, getInspection, createInspection, updateInspection, deleteInspection } from './quality.controller';

const router = Router();
router.use(authenticate);

router.get('/inspections', getInspections);
router.post('/inspections', createInspection);
router.get('/inspections/:id', getInspection);
router.put('/inspections/:id', updateInspection);
router.delete('/inspections/:id', deleteInspection);

export default router;
