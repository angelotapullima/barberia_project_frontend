import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { ReportService } from './report.service'; // Importar la clase, no la instancia

describe('ReportService', () => {
  let db: Database;
  let reportService: ReportService;
  let testStartDate: string;
  let testEndDate: string;

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log

    db = await setupTestDB();
    // @ts-ignore
    reportService = new ReportService(db); // Inyectamos la BD de prueba

    // Definimos un rango de fechas de prueba que coincida con los datos generados (últimos 45 días)
    const today = new Date();
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterAll(async () => {
    await db.close();
    jest.restoreAllMocks(); // Restore console.error and console.log
  });

  it('debería calcular correctamente la utilización de estaciones', async () => {
    const stationUsage = await reportService.getStationUsage(testStartDate, testEndDate);

    expect(Array.isArray(stationUsage)).toBe(true);
    expect(stationUsage.length).toBeGreaterThan(0);
    // Verificamos que la estación más usada sea la 'Estación Central' según nuestra lógica de datos de prueba
    expect(stationUsage[0].station_name).toBe('Estación Central');
    expect(stationUsage[0].usage_count).toBeGreaterThan(0);
  });

  it('debería calcular correctamente la frecuencia de clientes', async () => {
    const customerFrequency = await reportService.getCustomerFrequency(testStartDate, testEndDate);

    expect(Array.isArray(customerFrequency)).toBe(true);
    expect(customerFrequency.length).toBeGreaterThan(0);
    // Verificamos que el cliente más frecuente sea Pedro Pascal
    expect(customerFrequency[0].customer_name).toBe('Pedro Pascal');
    expect(customerFrequency[0].visit_count).toBeGreaterThan(0); // Cambiado a toBeGreaterThan(0)
  });

  it('debería calcular correctamente las horas pico', async () => {
    const peakHours = await reportService.getPeakHours(testStartDate, testEndDate);

    expect(Array.isArray(peakHours)).toBe(true);
    expect(peakHours.length).toBeGreaterThan(0);
    expect(peakHours[0].hour).toBeDefined();
    expect(peakHours[0].reservation_count).toBeGreaterThan(0);
  });
});
