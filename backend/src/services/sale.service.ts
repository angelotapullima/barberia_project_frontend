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

  async getAllSales(): Promise<Sale[]> {
    const sales = await this.db.all(`
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, 
          b.name as barber_name, st.name as station_name
      FROM sales s
      JOIN barbers b ON s.barber_id = b.id
      JOIN stations st ON s.station_id = st.id
      ORDER BY s.sale_date DESC
    `);
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
}

export const saleService = new SaleService();
