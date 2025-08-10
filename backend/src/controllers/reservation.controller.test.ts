import { Request, Response } from 'express';
import { reservationController } from '../controllers/reservation.controller'; // Importar la instancia
import { reservationService } from '../services/reservation.service';

// Mock del servicio de reservación
jest.mock('../services/reservation.service', () => ({
  reservationService: {
    getAllReservations: jest.fn(),
    getReservationById: jest.fn(),
    createReservation: jest.fn(),
    updateReservation: jest.fn(),
    deleteReservation: jest.fn(),
    getReservationCount: jest.fn(),
    getCompletedReservationCount: jest.fn(),
    getCompletedReservations: jest.fn(),
  },
}));

describe('ReservationController', () => {
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

  it('debería obtener todas las reservaciones', async () => {
    const reservations = [{ id: 1, customer_name: 'Cliente 1' }];
    (reservationService.getAllReservations as jest.Mock).mockResolvedValue(reservations);

    await reservationController.getAllReservations(mockRequest as Request, mockResponse as Response);

    expect(reservationService.getAllReservations).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(reservations);
  });

  it('debería obtener una reservación por ID', async () => {
    const reservation = { id: 1, customer_name: 'Cliente 1' };
    (reservationService.getReservationById as jest.Mock).mockResolvedValue(reservation);

    mockRequest.params = { id: '1' };

    await reservationController.getReservationById(mockRequest as Request, mockResponse as Response);

    expect(reservationService.getReservationById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(reservation);
  });

  it('debería crear una nueva reservación', async () => {
    const newReservation = {
      barber_id: 1,
      station_id: 1,
      customer_name: 'Nuevo Cliente',
      start_time: '2025-08-15T10:00:00.000Z',
      end_time: '2025-08-15T11:00:00.000Z',
    };
    const createdReservation = { id: 2, ...newReservation };
    (reservationService.createReservation as jest.Mock).mockResolvedValue(createdReservation);

    mockRequest.body = newReservation;

    await reservationController.createReservation(mockRequest as Request, mockResponse as Response);

    expect(reservationService.createReservation).toHaveBeenCalledWith(newReservation);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdReservation);
  });

  it('debería actualizar una reservación existente', async () => {
    mockRequest.params = { id: '1' };
    mockRequest.body = { customer_name: 'Cliente Actualizado' };

    await reservationController.updateReservation(mockRequest as Request, mockResponse as Response);

    expect(reservationService.updateReservation).toHaveBeenCalledWith(1, { customer_name: 'Cliente Actualizado' });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reservation updated successfully' });
  });

  it('debería eliminar una reservación', async () => {
    (reservationService.deleteReservation as jest.Mock).mockResolvedValue(undefined);

    mockRequest.params = { id: '1' };

    await reservationController.deleteReservation(mockRequest as Request, mockResponse as Response);

    expect(reservationService.deleteReservation).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reservation deleted successfully' });
  });

  it('debería obtener el conteo de reservaciones', async () => {
    (reservationService.getReservationCount as jest.Mock).mockResolvedValue(10);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reservationController.getReservationCount(mockRequest as Request, mockResponse as Response);

    expect(reservationService.getReservationCount).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
    expect(mockResponse.json).toHaveBeenCalledWith({ count: 10 });
  });

  it('debería obtener el conteo de reservaciones completadas', async () => {
    (reservationService.getCompletedReservationCount as jest.Mock).mockResolvedValue(5);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reservationController.getCompletedReservationCount(mockRequest as Request, mockResponse as Response);

    expect(reservationService.getCompletedReservationCount).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
    expect(mockResponse.json).toHaveBeenCalledWith({ count: 5 });
  });

  it('debería obtener las reservaciones completadas', async () => {
    const completedReservations = [{ id: 1, customer_name: 'Cliente Completado' }];
    (reservationService.getCompletedReservations as jest.Mock).mockResolvedValue(completedReservations);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reservationController.getCompletedReservations(mockRequest as Request, mockResponse as Response);

    expect(reservationService.getCompletedReservations).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
    expect(mockResponse.json).toHaveBeenCalledWith(completedReservations);
  });

  // Manejo de errores
  it('debería manejar errores al obtener todas las reservaciones', async () => {
    (reservationService.getAllReservations as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    await reservationController.getAllReservations(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});