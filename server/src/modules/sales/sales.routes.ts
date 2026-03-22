import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate, createOrderRules, createCustomerRules } from '../../middleware/validation.middleware';
import * as orders from './orders.controller';
import * as customers from './customers.controller';
import * as invoices from './invoices.controller';

const router = Router();
router.use(authenticate);

router.get('/orders', orders.getOrders);
router.post('/orders', createOrderRules, validate, orders.createOrder);
router.get('/orders/analytics', orders.getAnalytics);
router.get('/orders/:id', orders.getOrder);
router.put('/orders/:id', orders.updateOrder);
router.delete('/orders/:id', orders.deleteOrder);

router.get('/customers', customers.getCustomers);
router.post('/customers', createCustomerRules, validate, customers.createCustomer);
router.get('/customers/:id', customers.getCustomer);
router.put('/customers/:id', customers.updateCustomer);
router.delete('/customers/:id', customers.deleteCustomer);

router.get('/invoices', invoices.getInvoices);
router.post('/invoices', invoices.createInvoice);
router.get('/invoices/:id', invoices.getInvoice);
router.get('/invoices/:id/download', invoices.downloadInvoice);
router.post('/invoices/:id/send', invoices.sendInvoice);
router.put('/invoices/:id', invoices.updateInvoice);

export default router;
