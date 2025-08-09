const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

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
  const stations = await db.get('SELECT COUNT(*) as count FROM stations');
  if (stations.count === 0) {
    await db.run('INSERT INTO stations (name) VALUES (?), (?), (?)', [
      'Estación 1',
      'Estación 2',
      'Estación 3',
    ]);
  }

  const barbers = await db.get('SELECT COUNT(*) as count FROM barbers');
  if (barbers.count === 0) {
    await db.run('INSERT INTO barbers (name, station_id) VALUES (?, ?), (?, ?)', [
      'Juan Pérez',
      1,
      'Luis Gómez',
      2,
    ]);
  }

  const services = await db.get('SELECT COUNT(*) as count FROM services');
  if (services.count === 0) {
    await db.run('INSERT INTO services (name, price) VALUES (?, ?), (?, ?), (?, ?)', [
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

module.exports = setup();
