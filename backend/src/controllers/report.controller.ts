import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

class ReportController {
  async getReport(req: Request, res: Response): Promise<void> {
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(400).json({ error: 'Year and month are required' });
      return;
    }

    try {
      const reportData = await reportService.generateReport(Number(year), Number(month));
      res.json(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report.' });
    }
  }

  async getComprehensiveSalesReport(req: Request, res: Response): Promise<void> {
    const filters = req.query; // Filters will be passed as query parameters

    try {
      const salesData = await reportService.getComprehensiveSales({
        barberId: filters.barberId ? Number(filters.barberId) : undefined,
        serviceId: filters.serviceId ? Number(filters.serviceId) : undefined,
        paymentMethod: filters.paymentMethod ? String(filters.paymentMethod) : undefined,
        startDate: filters.startDate ? String(filters.startDate) : undefined,
        endDate: filters.endDate ? String(filters.endDate) : undefined,
      });
      res.json(salesData);
    } catch (error) {
      console.error('Error fetching comprehensive sales report:', error);
      res.status(500).json({ error: 'Failed to fetch comprehensive sales report.' });
    }
  }

  async getServicesProductsSalesReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    try {
      const salesData = await reportService.getServicesProductsSales(String(startDate), String(endDate));
      res.json(salesData);
    } catch (error) {
      console.error('Error fetching services/products sales report:', error);
      res.status(500).json({ error: 'Failed to fetch services/products sales report.' });
    }
  }
}

export const reportController = new ReportController();
