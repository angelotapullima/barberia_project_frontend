import { Request, Response } from 'express';
import { reservationService } from '../services/reservation.service';

class ReservationController {
  async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await reservationService.getAllReservations();
      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(Number(id));
      if (reservation) {
        res.json(reservation);
      } else {
        res.status(404).json({ error: 'Reservation not found' });
      }
    } catch (error) {
      console.error('Error getting reservation by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createReservation(req: Request, res: Response): Promise<void> {
    const { barber_id, station_id, customer_name, customer_phone, start_time, end_time } = req.body;

    if (!barber_id || !station_id || !customer_name || !start_time || !end_time) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const newReservation = await reservationService.createReservation({
        barber_id,
        station_id,
        customer_name,
        customer_phone,
        start_time,
        end_time,
      });
      res.status(201).json(newReservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation.' });
    }
  }

  async updateReservation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { barber_id, station_id, customer_name, customer_phone, start_time, end_time, status } = req.body;

    try {
      await reservationService.updateReservation(Number(id), {
        barber_id,
        station_id,
        customer_name,
        customer_phone,
        start_time,
        end_time,
        status,
      });
      res.status(200).json({ message: 'Reservation updated successfully' });
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ error: 'Failed to update reservation.' });
    }
  }

  async deleteReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await reservationService.deleteReservation(Number(id));
      res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ error: 'Failed to delete reservation.' });
    }
  }

  async getReservationCount(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }
    try {
      const count = await reservationService.getReservationCount(startDate as string, endDate as string);
      res.json({ count });
    } catch (error) {
      console.error('Error getting reservation count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCompletedReservationCount(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }
    try {
      const count = await reservationService.getCompletedReservationCount(startDate as string, endDate as string);
      res.json({ count });
    } catch (error) {
      console.error('Error getting completed reservation count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const reservationController = new ReservationController();
