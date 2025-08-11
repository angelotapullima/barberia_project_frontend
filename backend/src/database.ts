import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbPromise: Promise<Database> | null = null;

// --- Lógica de Creación de Schema y Datos de Prueba ---

async function createSchema(db: Database) {
  await db.exec(`
        CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      specialty TEXT,
      photo_url TEXT,
      station_id INTEGER, -- Added station_id
      base_salary REAL DEFAULT 1300,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'service', -- Added
      stock_quantity INTEGER DEFAULT 0,    -- Added
      min_stock_level INTEGER DEFAULT 0,   -- Added
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER UNSIGNED NOT NULL,
      station_id INTEGER UNSIGNED NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      client_email TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      service_id INTEGER UNSIGNED NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER UNSIGNED,
      barber_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      customer_name TEXT, -- Added
      payment_method TEXT DEFAULT 'cash',
      sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE SET NULL,
      FOREIGN KEY (barber_id) REFERENCES barbers (id),
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER UNSIGNED NOT NULL,
      service_id INTEGER UNSIGNED,
      item_type TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL,
      price_at_sale REAL NOT NULL, -- Added
      quantity INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function seedDatabase(db: Database) {
  console.log('Insertando datos de prueba...');
  await db.run('INSERT INTO stations (name) VALUES (?), (?), (?)', ['Estación Central', 'Estación VIP', 'Estación Rápida']);
  const stations = await db.all('SELECT id FROM stations');
  await db.run(
    'INSERT INTO barbers (name, email, phone, specialty, photo_url) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
    [
      'Juan Pérez', 'juan.perez@example.com', '+51987654321', 'Cortes Modernos', 'https://example.com/juan.jpg',
      'Luis Gómez', 'luis.gomez@example.com', '+51912345678', 'Barbas Clásicas', 'https://example.com/luis.jpg',
      'Carlos Ruiz', 'carlos.ruiz@example.com', '+51998877665', 'Coloración', 'https://example.com/carlos.jpg'
    ]
  );
  const barbers = await db.all('SELECT id FROM barbers');
  await db.run('INSERT INTO services (name, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)', [
  'Corte de Cabello', 30, 30, 'service', 0, 0,
  'Afeitado Clásico', 25, 45, 'service', 0, 0,
  'Corte y Barba', 50, 60, 'service', 0, 0,
  'Cera para Peinar', 15, 0, 'product', 100, 10,
  'Aceite para Barba', 20, 0, 'product', 50, 5,
  'Shampoo Especializado', 35, 0, 'product', 20, 25, // Low stock
  'Acondicionador Premium', 30, 0, 'product', 15, 10,
  'Gel Fijador Fuerte', 12, 0, 'product', 5, 10, // Low stock
  'Navajas Desechables (pack)', 8, 0, 'product', 30, 5
]);
  const services = await db.all('SELECT id, name, price, type, duration_minutes FROM services');
  const customers = ['Pedro Pascal', 'Ana de Armas', 'Ricardo Arjona', 'Shakira Mebarak', 'Lionel Messi', 'Karol G', 'Bad Bunny'];
  const paymentMethods = ['cash', 'card', 'yape', 'plin'];
  const today = new Date();
  for (let i = 45; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const salesToday = Math.floor(Math.random() * 8) + 2;
    for (let s = 0; s < salesToday; s++) {
      const barber = barbers[s % barbers.length];
      const station = stations[s % stations.length];
      const customer = customers[s % customers.length];
      const paymentMethod = paymentMethods[s % paymentMethods.length];
      const numServices = Math.random() > 0.7 ? 2 : 1;
      let totalAmount = 0;
      let itemsSold = [];
      for (let j = 0; j < numServices; j++) {
        const service = services[(s + j) % services.length];
        itemsSold.push(service);
        totalAmount += service.price;
      }
      const saleResult = await db.run('INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)', [dateString, barber.id, station.id, totalAmount, customer]);
      const saleId = saleResult.lastID;
      for (const item of itemsSold) {
        await db.run('INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)', [saleId, item.id, item.type, item.name, item.price, item.price, 1]); // Assuming quantity 1 for now
      }
    }
  }

  // Generar Reservas (re-insertado)
  for (let i = 45; i >= 0; i--) {
    const date = new Date(today); // Create a new Date object for each day
    date.setDate(today.getDate() - i);
    const reservationsToday = Math.floor(Math.random() * 5) + 1; // Al menos 1 reserva por día
    for (let r = 0; r < reservationsToday; r++) {
      const hour = 9 + Math.floor(Math.random() * 10); // Horas entre 9 AM y 6 PM
      const minute = Math.random() > 0.5 ? 30 : 0;

      // Create a new Date object for startTime based on the current day's date
      const startTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
        0,
        0
      );
      // Select a random service and use its duration
      const randomService = services[Math.floor(Math.random() * services.length)];
      const endTime = new Date(startTime.getTime() + randomService.duration_minutes * 60000);

      await db.run(
        'INSERT INTO reservations (barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          barbers[r % barbers.length].id,
          stations[r % stations.length].id, // Added station_id
          customers[r % customers.length], // client_name
          `+519${Math.floor(Math.random() * 900000000) + 100000000}`, // client_phone
          `${customers[r % customers.length].toLowerCase().replace(/\s/g, '')}@example.com`, // client_email
          startTime.toISOString(),
          endTime.toISOString(),
          randomService.id, // service_id
          'completed',
          'Nota de prueba para la reserva.', // notes
        ]
      );
    }
  }

  console.log('Datos de prueba insertados.');
}

// --- Lógica de Conexión ---

async function initializeDatabase(isTest = false): Promise<Database> {
  const db = await open(isTest ? { filename: ':memory:', driver: sqlite3.Database } : { filename: './barberia.sqlite', driver: sqlite3.Database });
  await createSchema(db);

  if (!isTest) {
    const barbersCount = await db.get('SELECT COUNT(*) as count FROM barbers');
    if (barbersCount.count === 0) {
      console.log('Base de datos de desarrollo vacía, insertando datos...');
      await seedDatabase(db);
    }
  }

  return db;
}

function setup(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = initializeDatabase(false);
  }
  return dbPromise;
}

// Exportamos una función separada para obtener una instancia de BD para tests
export async function setupTestDB(): Promise<Database> {
    const db = await initializeDatabase(true); // true para usar la DB en memoria
    await seedDatabase(db); // Llenamos la BD de prueba con datos
    return db;
}

export default setup;