import { Router } from 'express';
import {
  superAdminLogin, getSuperAdminProfile, updateSuperAdminProfile,
  getStats, getTenants, getTenantDetail, setTenantStatus, deleteTenant,
  getPlans, createPlan, updatePlan, deletePlan,
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
  getPaymentGateways, upsertPaymentGateway,
  getSettings, updateSettings,
  getAuditLogs,
} from './superadmin.controller';
import { authenticateSuperAdmin } from '../../middleware/superadmin.middleware';

const router = Router();
const sa = authenticateSuperAdmin;

// Auth
router.post('/login', superAdminLogin);
router.get('/profile', sa, getSuperAdminProfile);
router.put('/profile', sa, updateSuperAdminProfile);

// Stats
router.get('/stats', sa, getStats);

// Tenants
router.get('/tenants', sa, getTenants);
router.get('/tenants/:id', sa, getTenantDetail);
router.patch('/tenants/:id/status', sa, setTenantStatus);
router.delete('/tenants/:id', sa, deleteTenant);

// Plans
router.get('/plans', sa, getPlans);
router.post('/plans', sa, createPlan);
router.put('/plans/:id', sa, updatePlan);
router.delete('/plans/:id', sa, deletePlan);

// Coupons
router.get('/coupons', sa, getCoupons);
router.post('/coupons', sa, createCoupon);
router.put('/coupons/:id', sa, updateCoupon);
router.delete('/coupons/:id', sa, deleteCoupon);
router.post('/coupons/validate', validateCoupon); // public

// Payment Gateways
router.get('/payment-gateways', sa, getPaymentGateways);
router.post('/payment-gateways', sa, upsertPaymentGateway);

// Settings
router.get('/settings', sa, getSettings);
router.post('/settings', sa, updateSettings);

// Audit Log
router.get('/audit-logs', sa, getAuditLogs);

export default router;
