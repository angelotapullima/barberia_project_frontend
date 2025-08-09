import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';

const router = Router();

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);

export default router;
