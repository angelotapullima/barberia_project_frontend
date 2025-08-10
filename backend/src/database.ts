import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export async function setupDatabase(): Promise<Database> {
  if (db) {
    return db; // Return existing connection if already established
  }

  db = await open({
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
      name TEXT NOT NULL UNIQUE,
      base_salary REAL DEFAULT 1300,
      station_id INTEGER,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date TEXT NOT NULL,
      barber_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      customer_name TEXT,
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
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barber_id) REFERENCES barbers (id),
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );
  `);

  // Pre-seed some data for testing if tables are empty
  const stationsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM stations');
  if (stationsCount && stationsCount.count === 0) {
    await db.run('INSERT OR IGNORE INTO stations (name) VALUES (?), (?), (?)', [
      'Estación 1',
      'Estación 2',
      'Estación 3',
    ]);
  }

  const barbersCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM barbers');
  if (barbersCount && barbersCount.count === 0) {
    await db.run('INSERT OR IGNORE INTO barbers (name, station_id) VALUES (?, ?), (?, ?)', [
      'Juan Pérez',
      1,
      'Luis Gómez',
      2,
    ]);
  }

  const servicesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM services');
  if (servicesCount && servicesCount.count === 0) {
    await db.run('INSERT OR IGNORE INTO services (name, price) VALUES (?, ?), (?, ?), (?, ?)', [
      'Corte Básico',
      25,
      'Corte + Barba',
      40,
      'Refresco',
      5,
    ]);
  }

  // Seed some sample reservations
  const reservationsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM reservations');
  if (reservationsCount && reservationsCount.count === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, customer_phone, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Cliente Reserva 1', '123456789', `${today.toISOString().slice(0, 10)}T10:00:00`, `${today.toISOString().slice(0, 10)}T11:00:00`, 'confirmed']
    );
    await db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, customer_phone, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [2, 2, 'Cliente Reserva 2', '987654321', `${tomorrow.toISOString().slice(0, 10)}T14:00:00`, `${tomorrow.toISOString().slice(0, 10)}T15:00:00`, 'pending']
    );
  }

  // Seed some sample sales
  const salesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM sales');
  if (salesCount && salesCount.count === 0) {
    const saleDate1 = new Date();
    saleDate1.setDate(saleDate1.getDate() - 2); // 2 days ago
    const saleDate2 = new Date();
    saleDate2.setDate(saleDate2.getDate() - 1); // 1 day ago

    const sale1Result = await db.run(
      'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)',
      [saleDate1.toISOString().slice(0, 10), 1, 1, 25, 'Cliente Venta 1']
    );
    await db.run(
      'INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)',
      [sale1Result.lastID, 1, 25]
    );

    const sale2Result = await db.run(
      'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)',
      [saleDate2.toISOString().slice(0, 10), 2, 2, 40, 'Cliente Venta 2']
    );
    await db.run(
      'INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)',
      [sale2Result.lastID, 2, 40]
    );
  }

  return db;
}
