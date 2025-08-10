import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';

const router = Router();

// Specific routes should come before general routes with parameters
router.get('/count', reservationController.getReservationCount);
router.get('/count-completed', reservationController.getCompletedReservationCount);

router.get('/:id', reservationController.getReservationById); // This should come after specific routes
router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

export default router;