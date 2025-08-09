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
}

export const reportController = new ReportController();
