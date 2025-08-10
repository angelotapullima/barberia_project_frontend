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

  return db;
}
