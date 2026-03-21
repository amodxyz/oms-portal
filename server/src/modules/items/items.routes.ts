import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate, createItemRules } from '../../middleware/validation.middleware';
import * as items from './items.controller';
import * as stock from './stock.controller';
import * as categories from './categories.controller';
import * as bom from './bom.controller';

const router = Router();
router.use(authenticate);

router.get('/', items.getItems);
router.post('/', createItemRules, validate, items.createItem);
router.get('/summary', stock.getStockSummary);
router.get('/raw-materials', items.getRawMaterials);
router.post('/stock/entry', stock.createStockEntry);
router.get('/categories/all', categories.getCategories);
router.post('/categories', categories.createCategory);
router.put('/categories/:id', categories.updateCategory);
router.delete('/categories/:id', categories.deleteCategory);
router.get('/bom/all', bom.getBOMs);
router.post('/bom', bom.createBOM);
router.get('/bom/:id', bom.getBOM);
router.put('/bom/:id', bom.updateBOM);
router.delete('/bom/:id', bom.deleteBOM);
router.get('/:id', items.getItem);
router.put('/:id', items.updateItem);
router.delete('/:id', items.deleteItem);
router.get('/:id/stock', stock.getItemStock);

export default router;
