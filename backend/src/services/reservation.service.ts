import setupDatabase from '../database';
import { Database } from 'sqlite';

interface Reservation {
  id?: number;
  barber_id: number;
  station_id: number;
  customer_name: string;
  customer_phone?: string;
  start_time: string;
  end_time: string;
  status?: string;
  created_at?: string;
  barber_name?: string;
  station_name?: string;
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
          r.station_id, st.name as station_name,
          r.customer_name, r.customer_phone, r.start_time, r.end_time, r.status, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN stations st ON r.station_id = st.id
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
          r.station_id, st.name as station_name,
          r.customer_name, r.customer_phone, r.start_time, r.end_time, r.status, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN stations st ON r.station_id = st.id
      WHERE r.id = ?
    `, id);
    return reservation;
  }

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const { barber_id, station_id, customer_name, customer_phone, start_time, end_time } = reservation;
    const result = await this.db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, customer_phone, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [barber_id, station_id, customer_name, customer_phone || null, start_time, end_time]
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
    if (reservation.station_id !== undefined) {
      fields.push('station_id = ?');
      params.push(reservation.station_id);
    }
    if (reservation.customer_name !== undefined) {
      fields.push('customer_name = ?');
      params.push(reservation.customer_name);
    }
    if (reservation.customer_phone !== undefined) {
      fields.push('customer_phone = ?');
      params.push(reservation.customer_phone);
    }
    if (reservation.start_time !== undefined) {
      fields.push('start_time = ?');
      params.push(reservation.start_time);
    }
    if (reservation.end_time !== undefined) {
      fields.push('end_time = ?');
      params.push(reservation.end_time);
    }
    if (reservation.status !== undefined) {
      fields.push('status = ?');
      params.push(reservation.status);
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
          r.customer_name, r.customer_phone, r.start_time, r.end_time, r.status, r.created_at
      FROM reservations r
      JOIN barbers b ON r.barber_id = b.id
      JOIN stations st ON r.station_id = st.id
      WHERE date(r.start_time) BETWEEN ? AND ? AND r.status = 'completed'
      ORDER BY r.start_time DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }
}

export const reservationService = new ReservationService();
