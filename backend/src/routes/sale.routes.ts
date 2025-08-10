import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';

const router = Router();

router.get('/', saleController.getAllSales);
router.get('/filtered', saleController.getSalesFiltered); // New route for filtered sales
router.post('/', saleController.createSale);

router.get('/summary', saleController.getDailySalesSummary);
router.get('/ranking', saleController.getBarberRanking);
router.get('/total-payments', saleController.getTotalBarberPayments);

export default router;
