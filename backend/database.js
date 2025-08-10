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
      payment_method TEXT DEFAULT 'cash', -- New column
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

    // Insert dummy sales data
    const juanPerez = await db.get('SELECT id FROM barbers WHERE name = ?', 'Juan Pérez');
    const luisGomez = await db.get('SELECT id FROM barbers WHERE name = ?', 'Luis Gómez');
    const corteBasico = await db.get('SELECT id, price FROM services WHERE name = ?', 'Corte Básico');
    const corteBarba = await db.get('SELECT id, price FROM services WHERE name = ?', 'Corte + Barba');
    const refresco = await db.get('SELECT id, price FROM services WHERE name = ?', 'Refresco');

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Sale 1: Today, Juan Pérez, Corte Básico + Refresco
    let saleResult = await db.run(
      'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [today.toISOString().slice(0, 10), juanPerez.id, 1, corteBasico.price + refresco.price, 'Cliente A', 'cash']
    );
    let saleId = saleResult.lastID;
    await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [saleId, corteBasico.id, corteBasico.price]);
    await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [saleId, refresco.id, refresco.price]);

    // Sale 2: 3 days ago, Luis Gómez, Corte + Barba
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    saleResult = await db.run(
      'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [threeDaysAgo.toISOString().slice(0, 10), luisGomez.id, 2, corteBarba.price, 'Cliente B', 'card']
    );
    saleId = saleResult.lastID;
    await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [saleId, corteBarba.id, corteBarba.price]);

    // Sale 3: 5 days ago, Juan Pérez, Corte Básico
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);
    saleResult = await db.run(
      'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [fiveDaysAgo.toISOString().slice(0, 10), juanPerez.id, 1, corteBasico.price, 'Cliente C', 'yape']
    );
    saleId = saleResult.lastID;
    await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [saleId, corteBasico.id, corteBasico.price]);

    // Insert dummy reservations data
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(today.getDate() + 2);

    // Reservation 1: Tomorrow, Juan Pérez, pending
    await db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [juanPerez.id, 1, 'Cliente Reserva 1', tomorrow.toISOString(), new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(), 'pending']
    );

    // Reservation 2: Day after tomorrow, Luis Gómez, completed
    await db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [luisGomez.id, 2, 'Cliente Reserva 2', dayAfterTomorrow.toISOString(), new Date(dayAfterTomorrow.getTime() + 90 * 60 * 1000).toISOString(), 'completed']
    );

    // Reservation 3: 2 days ago, Juan Pérez, completed (for historical data)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    await db.run(
      'INSERT INTO reservations (barber_id, station_id, customer_name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [juanPerez.id, 1, 'Cliente Reserva 3', twoDaysAgo.toISOString(), new Date(twoDaysAgo.getTime() + 60 * 60 * 1000).toISOString(), 'completed']
    );
  }

  return db;
}

module.exports = setup();
