import { setupDatabase } from '../database';
import { Database } from 'sqlite';

interface SaleItem {
  id?: number;
  sale_id?: number;
  service_id: number;
  price_at_sale: number;
}

interface Sale {
  id?: number;
  sale_date: string;
  barber_id: number;
  station_id: number;
  total_amount: number;
  customer_name?: string;
  services: SaleItem[];
  barber_name?: string;
  station_name?: string;
}

class SaleService {
  private db!: Database;

  constructor() {
    setupDatabase().then(db => {
      this.db = db;
    });
  }

  private async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return this.db.all('SELECT id, service_id, price_at_sale FROM sale_items WHERE sale_id = ?', saleId);
  }

  async getAllSales(): Promise<Sale[]> {
    const sales = await this.db.all(`
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, s.barber_id, s.station_id,
          b.name as barber_name, st.name as station_name
      FROM sales s
      JOIN barbers b ON s.barber_id = b.id
      JOIN stations st ON s.station_id = st.id
      ORDER BY s.sale_date DESC
    `);

    for (const sale of sales) {
      sale.services = await this.getSaleItems(sale.id!);
    }
    return sales;
  }

  async getFilteredSales(filterType: string, filterValue: string | number): Promise<Sale[]> {
    let query = `
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, s.barber_id, s.station_id,
          b.name as barber_name, st.name as station_name
      FROM sales s
      JOIN barbers b ON s.barber_id = b.id
      JOIN stations st ON s.station_id = st.id
    `;
    const params: (string | number)[] = [];

    switch (filterType) {
      case 'day':
        query += ` WHERE DATE(s.sale_date) = DATE(?)`;
        params.push(filterValue as string);
        break;
      case 'week':
        query += ` WHERE STRFTIME('%Y-%W', s.sale_date) = STRFTIME('%Y-%W', ?)`;
        params.push(filterValue as string);
        break;
      case 'month':
        query += ` WHERE STRFTIME('%Y-%m', s.sale_date) = STRFTIME('%Y-%m', ?)`;
        params.push(filterValue as string);
        break;
      case 'barber':
        query += ` WHERE s.barber_id = ?`;
        params.push(filterValue as number);
        break;
      default:
        // No filter, return all sales (handled by getAllSales if no filter is applied)
        break;
    }

    query += ` ORDER BY s.sale_date DESC`;

    const sales = await this.db.all(query, ...params);
    for (const sale of sales) {
      sale.services = await this.getSaleItems(sale.id!);
    }
    return sales;
  }

  async createSale(sale: Sale): Promise<Sale> {
    const { sale_date, barber_id, station_id, services, total_amount, customer_name } = sale;

    let saleId: number;
    try {
      await this.db.run('BEGIN TRANSACTION');

      const saleResult = await this.db.run(
        'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)',
        [sale_date, barber_id, station_id, total_amount, customer_name]
      );
      saleId = saleResult.lastID!;

      const stmt = await this.db.prepare(
        'INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)'
      );
      for (const service of services) {
        await stmt.run(saleId, service.service_id, service.price_at_sale);
      }
      await stmt.finalize();

      await this.db.run('COMMIT');
      return { id: saleId, ...sale };
    } catch (error) {
      await this.db.run('ROLLBACK');
      console.error('Transaction Error:', error);
      throw new Error('Failed to record sale.');
    }
  }

  async getSalesSummaryByDateRange(startDate: string, endDate: string): Promise<{ date: string; total: number }[]> {
    const query = `
      SELECT
          strftime('%Y-%m-%d', sale_date) as date,
          SUM(total_amount) as total
      FROM sales
      WHERE sale_date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  async getBarberSalesRanking(startDate: string, endDate: string): Promise<{ barber_id: number; barber_name: string; total_sales: number }[]> {
    const query = `
      SELECT
          b.id as barber_id,
          b.name as barber_name,
          SUM(s.total_amount) as total_sales
      FROM sales s
      JOIN barbers b ON s.barber_id = b.id
      WHERE s.sale_date BETWEEN ? AND ?
      GROUP BY b.id, b.name
      ORDER BY total_sales DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  async getTotalPaymentsToBarbers(startDate: string, endDate: string): Promise<number> {
    const barbers = await this.db.all<{ id: number; name: string; base_salary: number }[]>(
      'SELECT id, name, base_salary FROM barbers'
    );
    const salesByBarber = await this.db.all<{ barber_id: number; total_generated: number }[]>(
      `
            SELECT barber_id, SUM(total_amount) as total_generated
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY barber_id
        `,
      startDate,
      endDate
    );

    let totalPayments = 0;

    for (const barber of barbers) {
      const saleInfo = salesByBarber.find((s) => s.barber_id === barber.id);
      const total_generated = saleInfo ? saleInfo.total_generated : 0;
      let payment = barber.base_salary;

      if (total_generated > barber.base_salary) {
        payment = total_generated * 0.5;
      }
      totalPayments += payment;
    }
    return totalPayments;
  }

  async getSalesSummaryByService(startDate: string, endDate: string): Promise<{ service_name: string; total_sales: number }[]> {
    const query = `
      SELECT
          s.name as service_name,
          SUM(si.price_at_sale) as total_sales
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      JOIN services s ON si.service_id = s.id
      WHERE sa.sale_date BETWEEN ? AND ?
      GROUP BY s.name
      ORDER BY total_sales DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }
}

export const saleService = new SaleService();
