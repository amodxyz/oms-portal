import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getProductionOrders, getProductionOrder, createProductionOrder, updateProductionOrder, deleteProductionOrder } from './production.controller';

const router = Router();
router.use(authenticate);

router.get('/', getProductionOrders);
router.post('/', createProductionOrder);
router.get('/:id', getProductionOrder);
router.put('/:id', updateProductionOrder);
router.delete('/:id', deleteProductionOrder);

export default router;
