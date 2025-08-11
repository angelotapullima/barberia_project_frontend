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
    const { startDate, endDate, compareStartDate, compareEndDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required for the current period.' });
      return;
    }

    // Validar fechas de comparación solo si están presentes
    if ((compareStartDate && !compareEndDate) || (!compareStartDate && compareEndDate)) {
      res.status(400).json({ error: 'Both compareStartDate and compareEndDate are required if comparison is enabled.' });
      return;
    }

    try {
      const salesData = await reportService.getServicesProductsSales(
        String(startDate),
        String(endDate),
        compareStartDate ? String(compareStartDate) : undefined,
        compareEndDate ? String(compareEndDate) : undefined
      );
      res.json(salesData);
    } catch (error) {
      console.error('Error fetching services/products sales report:', error);
      res.status(500).json({ error: 'Failed to fetch services/products sales report.' });
    }
  }

  // Nuevos métodos para los reportes específicos
  async getStationUsageReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    try {
      const data = await reportService.getStationUsage(String(startDate), String(endDate));
      res.json(data);
    } catch (error) {
      console.error('Error fetching station usage report:', error);
      res.status(500).json({ error: 'Failed to fetch station usage report.' });
    }
  }

  async getCustomerFrequencyReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    try {
      const data = await reportService.getCustomerFrequency(String(startDate), String(endDate));
      res.json(data);
    } catch (error) {
      console.error('Error fetching customer frequency report:', error);
      res.status(500).json({ error: 'Failed to fetch customer frequency report.' });
    }
  }

  async getPeakHoursReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    try {
      const data = await reportService.getPeakHours(String(startDate), String(endDate));
      res.json(data);
    } catch (error) {
      console.error('Error fetching peak hours report:', error);
      res.status(500).json({ error: 'Failed to fetch peak hours report.' });
    }
  }
}

export const reportController = new ReportController();
