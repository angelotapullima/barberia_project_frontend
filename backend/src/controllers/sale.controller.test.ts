import { Request, Response } from 'express';
import { saleController } from '../controllers/sale.controller'; // Importar la instancia
import { saleService } from '../services/sale.service';

// Mock del servicio de venta
jest.mock('../services/sale.service', () => ({
  import { saleController } from '../controllers/sale.controller'; // Importar la instancia
import { saleService } from '../services/sale.service';

// Mock del servicio de venta
jest.mock('../services/sale.service', () => ({
  saleService: {
    getAllSales: jest.fn(),
    getSalesFiltered: jest.fn(),
    createSale: jest.fn(),
    getSalesSummaryByDateRange: jest.fn(),
    getBarberSalesRanking: jest.fn(),
    getTotalPaymentsToBarbers: jest.fn(),
    getSalesSummaryByService: jest.fn(),
    getSalesSummaryByPaymentMethod: jest.fn(),
  },
}));

describe('SaleController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(), // Añadido para manejar res.send()
    };
  });

  it('debería obtener todas las ventas', async () => {
    const sales = [{ id: 1, total_amount: 50 }];
    (saleService.getAllSales as jest.Mock).mockResolvedValue(sales);

    await saleController.getAllSales(mockRequest as Request, mockResponse as Response);

    expect(saleService.getAllSales).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(sales);
  });

  it('debería obtener ventas filtradas', async () => {
    const filteredSales = [{ id: 1, total_amount: 50 }];
    (saleService.getSalesFiltered as jest.Mock).mockResolvedValue(filteredSales);

    mockRequest.query = { filterType: 'day', filterValue: '2025-08-15' };

    await saleController.getSalesFiltered(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesFiltered).toHaveBeenCalledWith('day', '2025-08-15');
    expect(mockResponse.json).toHaveBeenCalledWith(filteredSales);
  });

  it('debería crear una nueva venta', async () => {
    const newSale = {
      sale_date: '2025-08-15',
      barber_id: 1,
      station_id: 1,
      services: [{ service_id: 1, price_at_sale: 30 }],
      total_amount: 30,
      payment_method: 'cash',
    };
    const createdSale = { id: 2, ...newSale };
    (saleService.createSale as jest.Mock).mockResolvedValue(createdSale);

    mockRequest.body = newSale;

    await saleController.createSale(mockRequest as Request, mockResponse as Response);

    expect(saleService.createSale).toHaveBeenCalledWith(newSale);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ id: createdSale.id });
  });

  it('debería obtener el resumen de ventas diarias', async () => {
    const summary = [{ date: '2025-08-15', total: 100 }];
    (saleService.getSalesSummaryByDateRange as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getDailySalesSummary(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByDateRange).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  it('debería obtener el ranking de barberos', async () => {
    const ranking = [{ barber_name: 'Juan', total_sales: 500 }];
    (saleService.getBarberSalesRanking as jest.Mock).mockResolvedValue(ranking);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getBarberRanking(mockRequest as Request, mockResponse as Response);

    expect(saleService.getBarberSalesRanking).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(ranking);
  });

  it('debería obtener el total de pagos a barberos', async () => {
    (saleService.getTotalPaymentsToBarbers as jest.Mock).mockResolvedValue(1500);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getTotalBarberPayments(mockRequest as Request, mockResponse as Response);

    expect(saleService.getTotalPaymentsToBarbers).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith({ totalPayments: 1500 });
  });

  it('debería obtener el resumen de ventas por servicio', async () => {
    const summary = [{ service_name: 'Corte', total_sales: 200 }];
    (saleService.getSalesSummaryByService as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getSalesSummaryByService(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByService).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  it('debería obtener el resumen de ventas por método de pago', async () => {
    const summary = [{ payment_method: 'cash', total_sales: 300 }];
    (saleService.getSalesSummaryByPaymentMethod as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getSalesSummaryByPaymentMethod(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByPaymentMethod).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  // Manejo de errores (ejemplo para un método)
  it('debería manejar errores al obtener todas las ventas', async () => {
    (saleService.getAllSales as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    await saleController.getAllSales(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
}));

describe('SaleController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(), // Añadido para manejar res.send()
    };
  });

  it('debería obtener todas las ventas', async () => {
    const sales = [{ id: 1, total_amount: 50 }];
    (saleService.getAllSales as jest.Mock).mockResolvedValue(sales);

    await saleController.getAllSales(mockRequest as Request, mockResponse as Response);

    expect(saleService.getAllSales).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(sales);
  });

  it('debería obtener ventas filtradas', async () => {
    const filteredSales = [{ id: 1, total_amount: 50 }];
    (saleService.getSalesFiltered as jest.Mock).mockResolvedValue(filteredSales);

    mockRequest.query = { filterType: 'day', filterValue: '2025-08-15' };

    await saleController.getSalesFiltered(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesFiltered).toHaveBeenCalledWith('day', '2025-08-15');
    expect(mockResponse.json).toHaveBeenCalledWith(filteredSales);
  });

  it('debería crear una nueva venta', async () => {
    const newSale = {
      sale_date: '2025-08-15',
      barber_id: 1,
      station_id: 1,
      services: [{ service_id: 1, price_at_sale: 30 }],
      total_amount: 30,
      payment_method: 'cash',
    };
    const createdSale = { id: 2, ...newSale };
    (saleService.createSale as jest.Mock).mockResolvedValue(createdSale);

    mockRequest.body = newSale;

    await saleController.createSale(mockRequest as Request, mockResponse as Response);

    expect(saleService.createSale).toHaveBeenCalledWith(newSale);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ id: createdSale.id });
  });

  it('debería obtener el resumen de ventas diarias', async () => {
    const summary = [{ date: '2025-08-15', total: 100 }];
    (saleService.getSalesSummaryByDateRange as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getDailySalesSummary(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByDateRange).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  it('debería obtener el ranking de barberos', async () => {
    const ranking = [{ barber_name: 'Juan', total_sales: 500 }];
    (saleService.getBarberSalesRanking as jest.Mock).mockResolvedValue(ranking);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getBarberRanking(mockRequest as Request, mockResponse as Response);

    expect(saleService.getBarberSalesRanking).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(ranking);
  });

  it('debería obtener el total de pagos a barberos', async () => {
    (saleService.getTotalPaymentsToBarbers as jest.Mock).mockResolvedValue(1500);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getTotalBarberPayments(mockRequest as Request, mockResponse as Response);

    expect(saleService.getTotalPaymentsToBarbers).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith({ totalPayments: 1500 });
  });

  it('debería obtener el resumen de ventas por servicio', async () => {
    const summary = [{ service_name: 'Corte', total_sales: 200 }];
    (saleService.getSalesSummaryByService as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getSalesSummaryByService(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByService).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  it('debería obtener el resumen de ventas por método de pago', async () => {
    const summary = [{ payment_method: 'cash', total_sales: 300 }];
    (saleService.getSalesSummaryByPaymentMethod as jest.Mock).mockResolvedValue(summary);

    mockRequest.query = { startDate: '2025-08-01', endDate: '2025-08-31' };

    await saleController.getSalesSummaryByPaymentMethod(mockRequest as Request, mockResponse as Response);

    expect(saleService.getSalesSummaryByPaymentMethod).toHaveBeenCalledWith('2025-08-01', '2025-08-31');
    expect(mockResponse.json).toHaveBeenCalledWith(summary);
  });

  // Manejo de errores (ejemplo para un método)
  it('debería manejar errores al obtener todas las ventas', async () => {
    (saleService.getAllSales as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    await saleController.getAllSales(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
