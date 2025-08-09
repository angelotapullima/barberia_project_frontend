import { Router } from 'express';
import { reportController } from '../controllers/report.controller';

const router = Router();

router.get('/', reportController.getReport);

export default router;
