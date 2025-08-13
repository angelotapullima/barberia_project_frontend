import setupDatabase from '../database';
import { Database } from 'sqlite';

interface CalendarEvent {
  title: string;
  start: string;
  allDay: boolean;
}

interface BarberStat {
  barber_id: number;
  barber_name: string;
  base_salary: number;
  total_generated: number;
  payment: number;
}

interface ReportData {
  events: CalendarEvent[];
  stats: BarberStat[];
}

export class ReportService {
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

  async generateReport(year: number, month: number): Promise<ReportData> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    // 1. Get calendar events (total sales per day)
    const calendarEvents = await this.db.all(
      `
            SELECT 
                strftime('%Y-%m-%d', sale_date) as date,
                SUM(total_amount) as total
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY date
        `,
      startDate,
      endDate,
    );

    const events: CalendarEvent[] = calendarEvents.map((e: any) => ({
      title: `S/ ${e.total.toFixed(2)}`,
      start: e.date,
      allDay: true,
    }));

    // 2. Get barber payment stats
    const barbers = await this.db.all<
      { id: number; name: string; base_salary: number }[]
    >('SELECT id, name, base_salary FROM barbers');
    const salesByBarber = await this.db.all<
      { barber_id: number; total_generated: number }[]
    >(
      `
            SELECT barber_id, SUM(total_amount) as total_generated
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY barber_id
        `,
      startDate,
      endDate,
    );

    const stats: BarberStat[] = barbers.map((barber) => {
      const saleInfo = salesByBarber.find((s) => s.barber_id === barber.id);
      const total_generated = saleInfo ? saleInfo.total_generated : 0;

      const BASE_SALARY = 1250;
      const COMMISSION_THRESHOLD = 2500;
      let payment = BASE_SALARY;

      if (total_generated > COMMISSION_THRESHOLD) {
        payment = total_generated * 0.5;
      }

      return {
        barber_id: barber.id,
        barber_name: barber.name,
        base_salary: BASE_SALARY, // Show the base salary used for calculation
        total_generated: total_generated,
        payment: payment,
      };
    });

    return { events, stats };
  }

  async getComprehensiveSales(filters: {
    barberId?: number;
    serviceId?: number;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = `
      SELECT
          s.id AS sale_id,
          s.sale_date,
          s.total_amount,
          s.customer_name,
          s.payment_method,
          b.name AS barber_name,
          st.name AS station_name,
          GROUP_CONCAT(svc.name || ' (' || si.price_at_sale || ')', ', ') AS services_sold
      FROM sales s
      JOIN barbers b ON s.barber_id = b.id
      JOIN stations st ON s.station_id = st.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN services svc ON si.service_id = svc.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.barberId) {
      query += ` AND s.barber_id = ?`;
      params.push(filters.barberId);
    }
    if (filters.serviceId) {
      query += ` AND si.service_id = ?`;
      params.push(filters.serviceId);
    }
    if (filters.paymentMethod) {
      query += ` AND s.payment_method = ?`;
      params.push(filters.paymentMethod);
    }
    if (filters.startDate) {
      query += ` AND s.sale_date >= ?`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ` AND s.sale_date <= ?`;
      params.push(filters.endDate);
    }

    query += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    return await this.db.all(query, params);
  }

  async getServicesProductsSales(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    const query = `
      SELECT
          s.type,
          SUM(si.price_at_sale) as total_sales_by_type
      FROM sale_items si
      JOIN services s ON si.service_id = s.id
      JOIN sales sa ON si.sale_id = sa.id
      WHERE sa.sale_date BETWEEN ? AND ?
      GROUP BY s.type
    `;
    return await this.db.all(query, [startDate, endDate]);
  }

  async getStationUsage(startDate: string, endDate: string): Promise<any[]> {
    // Este reporte calcula cuántas veces se usó cada estación en un período.
    const query = `
      SELECT
        st.name as station_name,
        COUNT(s.id) as usage_count
      FROM stations st
      LEFT JOIN sales s ON st.id = s.station_id AND date(s.sale_date) BETWEEN ? AND ?
      GROUP BY st.name
      ORDER BY usage_count DESC
    `;
    return await this.db.all(query, [startDate, endDate]);
  }

  async getCustomerFrequency(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    // Este reporte cuenta cuántas veces ha venido cada cliente.
    const query = `
      SELECT
        customer_name,
        COUNT(id) as visit_count
      FROM sales
      WHERE sale_date BETWEEN ? AND ? AND customer_name IS NOT NULL AND customer_name != ''
      GROUP BY customer_name
      ORDER BY visit_count DESC
      LIMIT 15 -- Limitamos a los 15 clientes más frecuentes
    `;
    return await this.db.all(query, [startDate, endDate]);
  }

  async getPeakHours(startDate: string, endDate: string): Promise<any[]> {
    // Este reporte encuentra las horas con más reservaciones.
    const query = `
      SELECT
        strftime('%H:00', start_time) as hour,
        COUNT(id) as reservation_count
      FROM reservations
      WHERE date(start_time) BETWEEN ? AND ?
      GROUP BY hour
      ORDER BY reservation_count DESC
    `;
    return await this.db.all(query, [startDate, endDate]);
  }
}

export const reportService = new ReportService();
