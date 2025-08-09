import { setupDatabase } from '../database';
import { Database } from 'sqlite';

interface Service {
  id?: number;
  name: string;
  price: number;
}

class ServiceService {
  private db!: Database;

  constructor() {
    setupDatabase().then(db => {
      this.db = db;
    });
  }

  async getAllServices(): Promise<Service[]> {
    const services = await this.db.all('SELECT * FROM services ORDER BY name');
    return services;
  }

  async createService(service: Service): Promise<Service> {
    const { name, price } = service;
    const result = await this.db.run('INSERT INTO services (name, price) VALUES (?, ?)', [name, price]);
    return { id: result.lastID, name, price };
  }

  async updateService(id: number, service: Service): Promise<Service | null> {
    const { name, price } = service;
    const result = await this.db.run('UPDATE services SET name = ?, price = ? WHERE id = ?', [
      name,
      price,
      id,
    ]);
    if (result.changes === 0) {
      return null;
    }
    return { id, name, price };
  }

  async deleteService(id: number): Promise<boolean | { error: string }> {
    const sale = await this.db.get('SELECT id FROM sales WHERE service_id = ?', id);
    if (sale) {
      return { error: 'No se puede eliminar el servicio porque está asociado a una venta.' };
    }

    const result = await this.db.run('DELETE FROM services WHERE id = ?', id);
    return result.changes !== undefined && result.changes > 0;
  }
}

export const serviceService = new ServiceService();
