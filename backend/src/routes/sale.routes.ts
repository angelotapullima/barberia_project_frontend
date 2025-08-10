import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';

const router = Router();

router.get('/', saleController.getAllSales);
router.get('/filtered', saleController.getSalesFiltered); // New route for filtered sales
router.post('/', saleController.createSale);

export default router;
