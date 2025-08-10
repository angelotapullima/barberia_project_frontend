import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  let db: Database;
  let reservationService: ReservationService;
  let testStartDate: string;
  let testEndDate: string;

  beforeEach(async () => {
    db = await setupTestDB(); // Obtener una nueva DB limpia para cada test
    reservationService = new ReservationService(db);

    const today = new Date();
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterEach(async () => {
    await db.close();
  });

  it('debería obtener todas las reservaciones', async () => {
    const reservations = await reservationService.getAllReservations();
    expect(Array.isArray(reservations)).toBe(true);
    expect(reservations.length).toBeGreaterThan(0);
    expect(reservations[0]).toHaveProperty('customer_name');
  });

  it('debería crear una nueva reservación', async () => {
    const newReservation = {
      barber_id: 1,
      station_id: 1,
      customer_name: 'Test Customer',
      customer_phone: '+1234567890',
      start_time: '2025-08-15T10:00:00.000Z',
      end_time: '2025-08-15T11:00:00.000Z',
    };
    const createdReservation = await reservationService.createReservation(newReservation);
    expect(createdReservation).toHaveProperty('id');
    expect(createdReservation.customer_name).toBe('Test Customer');

    const allReservations = await reservationService.getAllReservations();
    expect(allReservations.length).toBeGreaterThan(0); // Ya hay datos de prueba
  });

  it('debería obtener una reservación por ID', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    const reservation = await reservationService.getReservationById(firstReservationId);
    expect(reservation).toBeDefined();
    expect(reservation?.id).toBe(firstReservationId);
  });

  it('debería actualizar una reservación existente', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    const updatedName = 'Updated Customer';
    await reservationService.updateReservation(firstReservationId, { customer_name: updatedName });

    const updatedReservation = await reservationService.getReservationById(firstReservationId);
    expect(updatedReservation?.customer_name).toBe(updatedName);
  });

  it('debería eliminar una reservación', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    await reservationService.deleteReservation(firstReservationId);

    const deletedReservation = await reservationService.getReservationById(firstReservationId);
    expect(deletedReservation).toBeUndefined();
  });

  it('debería obtener el conteo de reservaciones en un rango de fechas', async () => {
    const count = await reservationService.getReservationCount(testStartDate, testEndDate);
    expect(count).toBeGreaterThan(0);
  });

  it('debería obtener el conteo de reservaciones completadas en un rango de fechas', async () => {
    const count = await reservationService.getCompletedReservationCount(testStartDate, testEndDate);
    expect(count).toBeGreaterThan(0);
  });

  it('debería obtener las reservaciones completadas en un rango de fechas', async () => {
    const completedReservations = await reservationService.getCompletedReservations(testStartDate, testEndDate);
    expect(Array.isArray(completedReservations)).toBe(true);
    expect(completedReservations.length).toBeGreaterThan(0);
    expect(completedReservations[0].status).toBe('completed');
  });
});
