import { Router } from 'express';
import { reportController } from '../controllers/report.controller';

const router = Router();

router.get('/', reportController.getReport);
router.get('/comprehensive-sales', reportController.getComprehensiveSalesReport);
router.get('/services-products-sales', reportController.getServicesProductsSalesReport);

export default router;
