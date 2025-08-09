import { Request, Response } from 'express';
import { saleService } from '../services/sale.service';

class SaleController {
  async getAllSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await saleService.getAllSales();
      res.json(sales);
    } catch (error) {
      console.error('Error getting sales:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createSale(req: Request, res: Response): Promise<void> {
    const { sale_date, barber_id, station_id, services, total_amount, customer_name } = req.body;

    // Validation
    if (
      !sale_date ||
      !barber_id ||
      !station_id ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0 ||
      total_amount === undefined
    ) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const newSale = await saleService.createSale({ sale_date, barber_id, station_id, services, total_amount, customer_name });
      res.status(201).json({ id: newSale.id });
    } catch (error) {
      console.error('Error creating sale:', error);
      res.status(500).json({ error: 'Failed to record sale.' });
    }
  }
}

export const saleController = new SaleController();
