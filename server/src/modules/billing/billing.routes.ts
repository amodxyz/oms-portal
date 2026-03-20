import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  getPlans, createPlan, updatePlan, deletePlan,
  getSubscriptions, getSubscription, createSubscription, updateSubscription, cancelSubscription,
  getBillingRecords, payBillingRecord, getBillingSummary,
} from './billing.controller';

const router = Router();
router.use(authenticate);

router.get('/summary', getBillingSummary);

router.get('/plans', getPlans);
router.post('/plans', authorize('ADMIN'), createPlan);
router.put('/plans/:id', authorize('ADMIN'), updatePlan);
router.delete('/plans/:id', authorize('ADMIN'), deletePlan);

router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', authorize('ADMIN', 'MANAGER'), createSubscription);
router.get('/subscriptions/:id', getSubscription);
router.put('/subscriptions/:id', authorize('ADMIN'), updateSubscription);
router.delete('/subscriptions/:id', authorize('ADMIN'), cancelSubscription);

router.get('/records', getBillingRecords);
router.put('/records/:id/pay', authorize('ADMIN', 'MANAGER'), payBillingRecord);

export default router;
