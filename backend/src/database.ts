import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbPromise: Promise<Database> | null = null;

// --- Lógica de Creación de Schema y Datos de Prueba ---

async function createSchema(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS barbers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, base_salary REAL DEFAULT 1300, station_id INTEGER, FOREIGN KEY (station_id) REFERENCES stations (id));
    CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, type TEXT NOT NULL DEFAULT 'service');
    CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_date TEXT NOT NULL, barber_id INTEGER NOT NULL, station_id INTEGER NOT NULL, total_amount REAL NOT NULL, customer_name TEXT, payment_method TEXT DEFAULT 'cash', FOREIGN KEY (barber_id) REFERENCES barbers (id), FOREIGN KEY (station_id) REFERENCES stations (id));
    CREATE TABLE IF NOT EXISTS sale_items (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER NOT NULL, service_id INTEGER NOT NULL, price_at_sale REAL NOT NULL, FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE, FOREIGN KEY (service_id) REFERENCES services (id));
    CREATE TABLE IF NOT EXISTS reservations (id INTEGER PRIMARY KEY AUTOINCREMENT, barber_id INTEGER NOT NULL, station_id INTEGER NOT NULL, customer_name TEXT NOT NULL, customer_phone TEXT, start_time TEXT NOT NULL, end_time TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (barber_id) REFERENCES barbers (id), FOREIGN KEY (station_id) REFERENCES stations (id));
  `);
}

export async function seedDatabase(db: Database) {
  console.log('Insertando datos de prueba...');
  await db.run('INSERT INTO stations (name) VALUES (?), (?), (?)', ['Estación Central', 'Estación VIP', 'Estación Rápida']);
  const stations = await db.all('SELECT id FROM stations');
  await db.run('INSERT INTO barbers (name, station_id) VALUES (?, ?), (?, ?), (?, ?)', ['Juan Pérez', stations[0].id, 'Luis Gómez', stations[1].id, 'Carlos Ruiz', stations[2].id]);
  const barbers = await db.all('SELECT id FROM barbers');
  await db.run('INSERT INTO services (name, price, type) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)', ['Corte de Cabello', 30, 'service', 'Afeitado Clásico', 25, 'service', 'Corte y Barba', 50, 'service', 'Cera para Peinar', 15, 'product', 'Aceite para Barba', 20, 'product']);
  const services = await db.all('SELECT id, price FROM services');
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
      const saleResult = await db.run('INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name, payment_method) VALUES (?, ?, ?, ?, ?, ?)', [dateString, barber.id, station.id, totalAmount, customer, paymentMethod]);
      const saleId = saleResult.lastID;
      for (const item of itemsSold) {
        await db.run('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)', [saleId, item.id, item.price]);
      }
    }
  }

  // Generar Reservas (re-insertado)
  for (let i = 45; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const reservationsToday = Math.floor(Math.random() * 5) + 1; // Al menos 1 reserva por día
    for (let r = 0; r < reservationsToday; r++) {
      const hour = 9 + Math.floor(Math.random() * 10); // Horas entre 9 AM y 6 PM
      const minute = Math.random() > 0.5 ? 30 : 0;
      const startTime = new Date(date.setHours(hour, minute, 0, 0));
      const endTime = new Date(startTime.getTime() + 60 * 60000); // Duración de 1 hora

      await db.run(
        'INSERT INTO reservations (barber_id, station_id, customer_name, customer_phone, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          barbers[r % barbers.length].id,
          stations[r % stations.length].id,
          customers[r % customers.length],
          `+519${Math.floor(Math.random() * 900000000) + 100000000}`,
          startTime.toISOString(),
          endTime.toISOString(),
          'completed',
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