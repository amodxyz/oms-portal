import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as transporters from './transporters.controller';
import * as dispatches from './dispatches.controller';

const router = Router();
router.use(authenticate);

router.get('/transporters', transporters.getTransporters);
router.post('/transporters', transporters.createTransporter);
router.put('/transporters/:id', transporters.updateTransporter);

router.get('/dispatches', dispatches.getDispatches);
router.post('/dispatches', dispatches.createDispatch);
router.get('/dispatches/:id', dispatches.getDispatch);
router.put('/dispatches/:id', dispatches.updateDispatch);

export default router;
