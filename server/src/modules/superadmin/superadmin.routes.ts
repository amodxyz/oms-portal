import { Router } from 'express';
import { superAdminLogin, getStats, getTenants, getTenantDetail, setTenantStatus, getSuperAdminProfile } from './superadmin.controller';
import { authenticateSuperAdmin } from '../../middleware/superadmin.middleware';

const router = Router();

router.post('/login', superAdminLogin);
router.get('/profile', authenticateSuperAdmin, getSuperAdminProfile);
router.get('/stats', authenticateSuperAdmin, getStats);
router.get('/tenants', authenticateSuperAdmin, getTenants);
router.get('/tenants/:id', authenticateSuperAdmin, getTenantDetail);
router.patch('/tenants/:id/status', authenticateSuperAdmin, setTenantStatus);

export default router;
