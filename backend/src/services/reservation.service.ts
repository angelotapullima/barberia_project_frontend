import setupDatabase from '../database';
import { Database } from 'sqlite';
import { saleService } from './sale.service'; // Import saleService

interface Reservation {
  id?: number;
  barber_id: number;
  station_id: number; // Added station_id
  client_name: string;
  client_phone?: string;
  client_email?: string;
  start_time: string;
  end_time: string;
  service_id: number;
  status?: string;
  notes?: string;
  created_at?: string;
  barber_name?: string;
  service_name?: string; // To display service name in frontend
}

export class ReservationService {
  private db!: Database;

  constructor(db?: Database) {
    if (db) {
      this.db = db;
    } else {
      setupDatabase().then((db: Database) => {
        this.db = db;
      });
    }
  }

  async getAllReservations(startDate?: string, endDate?: string): Promise<Reservation[]> {
    let query = `
      SELECT 
          r.id, r.barber_id, b.name as barber_name,
          r.client_name, r.client_phone, r.client_email,
          r.start_time, r.end_time, r.service_id, s.name as service_name,
          r.status, r.notes, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN services s ON r.service_id = s.id
    `;
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE date(r.start_time) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY r.start_time DESC';

    const reservations = await this.db.all(query, params);
    return reservations;
  }

  async getReservationById(id: number): Promise<Reservation | undefined> {
    const reservation = await this.db.get(`
      SELECT 
          r.id, r.barber_id, b.name as barber_name,
          r.station_id,
          r.client_name, r.client_phone, r.client_email,
          r.start_time, r.end_time, r.service_id, s.name as service_name,
          r.status, r.notes, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN services s ON r.service_id = s.id
      WHERE r.id = ?
    `, id);
    return reservation;
  }

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const { barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status, notes } = reservation; // Added station_id
    const result = await this.db.run(
      'INSERT INTO reservations (barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', // Added station_id column
      [barber_id, station_id, client_name, client_phone || null, client_email || null, start_time, end_time, service_id, status || 'pending', notes || null] // Added station_id value
    );
    return { id: result.lastID, ...reservation };
  }

  async updateReservation(id: number, reservation: Partial<Reservation>): Promise<void> {
    const fields = [];
    const params = [];

    if (reservation.barber_id !== undefined) {
      fields.push('barber_id = ?');
      params.push(reservation.barber_id);
    }
    if (reservation.client_name !== undefined) {
      fields.push('client_name = ?');
      params.push(reservation.client_name);
    }
    if (reservation.client_phone !== undefined) {
      fields.push('client_phone = ?');
      params.push(reservation.client_phone);
    }
    if (reservation.client_email !== undefined) {
      fields.push('client_email = ?');
      params.push(reservation.client_email);
    }
    if (reservation.start_time !== undefined) {
      fields.push('start_time = ?');
      params.push(reservation.start_time);
    }
    if (reservation.end_time !== undefined) {
      fields.push('end_time = ?');
      params.push(reservation.end_time);
    }
    if (reservation.service_id !== undefined) {
      fields.push('service_id = ?');
      params.push(reservation.service_id);
    }
    if (reservation.status !== undefined) {
      fields.push('status = ?');
      params.push(reservation.status);
    }
    if (reservation.notes !== undefined) {
      fields.push('notes = ?');
      params.push(reservation.notes);
    }
    if (reservation.station_id !== undefined) { // Added station_id to update
      fields.push('station_id = ?');
      params.push(reservation.station_id);
    }

    if (fields.length === 0) {
      return; // Nothing to update
    }

    params.push(id);
    const sql = `UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.run(sql, ...params);
  }

  async deleteReservation(id: number): Promise<void> {
    await this.db.run('DELETE FROM reservations WHERE id = ?', id);
  }

  async getReservationCount(startDate: string, endDate: string): Promise<number> {
    const result = await this.db.get(`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE start_time BETWEEN ? AND ?
    `, [startDate, endDate]);
    return result.count;
  }

  async getCompletedReservationCount(startDate: string, endDate: string): Promise<number> {
    const result = await this.db.get(`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE start_time BETWEEN ? AND ? AND status = 'completed'
    `, [startDate, endDate]);
    return result.count;
  }

  async getCompletedReservations(startDate: string, endDate: string): Promise<Reservation[]> {
    const query = `
      SELECT 
          r.id, r.barber_id, b.name as barber_name,
          r.station_id, st.name as station_name,
          r.client_name, r.client_phone, r.start_time, r.end_time, r.status, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN stations st ON r.station_id = st.id
      WHERE date(r.start_time) BETWEEN ? AND ? AND r.status = 'completed'
      ORDER BY r.start_time DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  async completeReservationAndCreateSale(reservationId: number): Promise<any> {
    const reservation = await this.getReservationById(reservationId);

    if (!reservation) {
      throw new Error('Reservation not found.');
    }

    if (reservation.status === 'completed') {
      throw new Error('Reservation is already completed.');
    }

    // Start a transaction for atomicity
    await this.db.run('BEGIN TRANSACTION');
    try {
      // 1. Update reservation status to 'completed'
      await this.updateReservation(reservationId, { status: 'completed' });

      // 2. Create a sale from the reservation
      // Fetch service details to get price for sale_items
      const service = await this.db.get('SELECT id, name, price, type FROM services WHERE id = ?', reservation.service_id);
      if (!service) {
        throw new Error('Service not found for reservation.');
      }

      const saleDate = new Date().toISOString().split('T')[0]; // Current date for the sale
      const totalAmount = service.price; // Assuming one service per reservation for simplicity

      const newSale = await saleService.createSale({
        sale_date: saleDate,
        barber_id: reservation.barber_id,
        station_id: reservation.station_id, // Use station_id from reservation
        total_amount: totalAmount,
        customer_name: reservation.client_name,
        payment_method: 'cash', // Default payment method for now
        reservation_id: reservation.id, // Link sale to reservation
        services: [{
          service_id: service.id,
          price_at_sale: service.price,
          name: service.name,
          type: service.type,
        }],
      });

      await this.db.run('COMMIT');
      return newSale;
    } catch (error) {
      await this.db.run('ROLLBACK');
      console.error('Error completing reservation and creating sale:', error);
      throw error; // Re-throw the error after rollback
    }
  }
}

export const reservationService = new ReservationService();
