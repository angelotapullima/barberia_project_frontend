import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function setup() {
  const db = await open({
    filename: './barberia.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base_salary REAL DEFAULT 1300,
      station_id INTEGER,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date TEXT NOT NULL,
      barber_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      customer_name TEXT,
      payment_method TEXT DEFAULT 'cash',
      FOREIGN KEY (barber_id) REFERENCES barbers (id),
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        price_at_sale REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services (id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barber_id) REFERENCES barbers (id),
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );
  `);

  // Helper functions for data generation
  function getRandomDate(start: Date, end: Date): Date {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date;
  }

  function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Pre-seed some data for testing if tables are empty
  const stationsCount = await db.get('SELECT COUNT(*) as count FROM stations');
  if (stationsCount.count === 0) {
    await db.run('INSERT INTO stations (name) VALUES (?), (?), (?)', [
      'Estación 1',
      'Estación 2',
      'Estación 3',
    ]);
  }

  const barbersCount = await db.get('SELECT COUNT(*) as count FROM barbers');
  if (barbersCount.count === 0) {
    await db.run('INSERT INTO barbers (name, station_id) VALUES (?, ?), (?, ?), (?, ?)', [
      'Juan Pérez', 1,
      'Luis Gómez', 2,
      'Carlos Ruiz', 3,
    ]);
  }

  const servicesCount = await db.get('SELECT COUNT(*) as count FROM services');
  if (servicesCount.count === 0) {
    await db.run('INSERT INTO services (name, price) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)', [
      'Corte Básico', 25,
      'Corte + Barba', 40,
      'Afeitado Clásico', 30,
      'Lavado de Cabello', 15,
      'Refresco', 5,
    ]);
  }

  // Fetch all necessary data for seeding
  const allBarbers = await db.all('SELECT id, name, station_id FROM barbers');
  const allStations = await db.all('SELECT id, name FROM stations');
  const allServices = await db.all('SELECT id, name, price FROM services');
  const paymentMethods = ['cash', 'card', 'yape', 'plin'];
  const customerNames = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'];

  // Generate Sales Data for the last 30 days
  const salesCount = await db.get('SELECT COUNT(*) as count FROM sales');
  if (salesCount.count === 0) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const currentDay = new Date(thirtyDaysAgo);
      currentDay.setDate(thirtyDaysAgo.getDate() + i);
      const salesPerDay = getRandomInt(3, 10); // 3 to 10 sales per day

      for (let j = 0; j < salesPerDay; j++) {
        const randomBarber = getRandomElement(allBarbers);
        const randomStation = getRandomElement(allStations);
        const randomPaymentMethod = getRandomElement(paymentMethods);
        const randomCustomer = getRandomElement(customerNames);

        const numServices = getRandomInt(1, 3); // 1 to 3 services per sale
        let selectedServices = [];
        let totalAmount = 0;
        for (let k = 0; k < numServices; k++) {
          const service = getRandomElement(allServices);
          selectedServices.push(service);
          totalAmount += service.price;
        }

        const saleDate = currentDay.toISOString().slice(0, 10);
        const saleResult = await db.run(
          'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
          [
            saleDate,
            randomBarber.id,
            randomStation.id,
            totalAmount,
            randomCustomer,
            randomPaymentMethod,
          ]
        );
        const saleId = saleResult.lastID;

        for (const service of selectedServices) {
          await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [
            saleId,
            service.id,
            service.price,
          ]);
        }
      }
    }
  }

  // Generate Reservations Data for the last 30 days
  const reservationsCount = await db.get('SELECT COUNT(*) as count FROM reservations');
  if (reservationsCount.count === 0) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const currentDay = new Date(thirtyDaysAgo);
      currentDay.setDate(thirtyDaysAgo.getDate() + i);
      const reservationsPerDay = getRandomInt(2, 7); // 2 to 7 reservations per day

      for (let j = 0; j < reservationsPerDay; j++) {
        const randomBarber = getRandomElement(allBarbers);
        const randomStation = getRandomElement(allStations);
        const randomCustomer = getRandomElement(customerNames);
        const status = getRandomElement(['pending', 'completed', 'cancelled']);

        const startTime = new Date(currentDay);
        startTime.setHours(getRandomInt(9, 18), getRandomInt(0, 59), 0, 0); // Random time between 9 AM and 6 PM
        const endTime = new Date(startTime.getTime() + getRandomInt(30, 90) * 60 * 1000); // 30 to 90 minutes duration

        await db.run(
          'INSERT INTO reservations (barber_id, station_id, customer_name, customer_phone, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            randomBarber.id,
            randomStation.id,
            randomCustomer,
            `+519${getRandomInt(10000000, 99999999)}`,
            startTime.toISOString(),
            endTime.toISOString(),
            status,
          ]
        );
      }
    }
  }

  return db;
}

export default setup;