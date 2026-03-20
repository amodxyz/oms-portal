import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate, createSupplierRules, createPurchaseOrderRules } from '../../middleware/validation.middleware';
import * as suppliers from './suppliers.controller';
import * as po from './purchase-orders.controller';

const router = Router();
router.use(authenticate);

router.get('/suppliers', suppliers.getSuppliers);
router.post('/suppliers', createSupplierRules, validate, suppliers.createSupplier);
router.get('/suppliers/:id', suppliers.getSupplier);
router.put('/suppliers/:id', suppliers.updateSupplier);
router.delete('/suppliers/:id', suppliers.deleteSupplier);

router.get('/orders', po.getPurchaseOrders);
router.post('/orders', createPurchaseOrderRules, validate, po.createPurchaseOrder);
router.get('/orders/:id', po.getPurchaseOrder);
router.put('/orders/:id', po.updatePurchaseOrder);
router.delete('/orders/:id', po.deletePurchaseOrder);

export default router;
