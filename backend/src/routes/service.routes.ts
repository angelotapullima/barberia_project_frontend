import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';

const router = Router();

router.get('/', serviceController.getAllServices);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;
