const express = require('express');
const cors = require('cors');
const dbPromise = require('./database.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route to confirm server is running
app.get('/', (req, res) => {
  res.send('Barbería API is running!');
});

// --- API Routes ---

// Barbers
app.get('/api/barbers', async (req, res) => {
    const db = await dbPromise;
    const barbers = await db.all('SELECT b.*, s.name as station_name FROM barbers b LEFT JOIN stations s ON b.station_id = s.id');
    res.json(barbers);
});

app.post('/api/barbers', async (req, res) => {
    const db = await dbPromise;
    const { name, station_id, base_salary } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const result = await db.run(
        'INSERT INTO barbers (name, station_id, base_salary) VALUES (?, ?, ?)',
        [name, station_id, base_salary || 1300]
    );
    res.status(201).json({ id: result.lastID, name, station_id, base_salary: base_salary || 1300 });
});

app.put('/api/barbers/:id', async (req, res) => {
    const db = await dbPromise;
    const { name, station_id, base_salary } = req.body;
    const { id } = req.params;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const result = await db.run(
        'UPDATE barbers SET name = ?, station_id = ?, base_salary = ? WHERE id = ?',
        [name, station_id, base_salary, id]
    );
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Barber not found' });
    }
    res.json({ id, name, station_id, base_salary });
});

app.delete('/api/barbers/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;
    const result = await db.run('DELETE FROM barbers WHERE id = ?', id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Barber not found' });
    }
    res.status(204).send();
});

// Stations
app.get('/api/stations', async (req, res) => {
    const db = await dbPromise;
    const stations = await db.all('SELECT * FROM stations ORDER BY name');
    res.json(stations);
});

app.post('/api/stations', async (req, res) => {
    const db = await dbPromise;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const stationCount = await db.get('SELECT COUNT(*) as count FROM stations');
    if (stationCount.count >= 10) {
        return res.status(400).json({ error: 'No se pueden crear más de 10 estaciones.' });
    }

    try {
        const result = await db.run('INSERT INTO stations (name) VALUES (?)', name);
        res.status(201).json({ id: result.lastID, name });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'El nombre de la estación ya existe.' });
        }
        res.status(500).json({ error: 'Could not add station' });
    }
});

app.put('/api/stations/:id', async (req, res) => {
    const db = await dbPromise;
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        const result = await db.run('UPDATE stations SET name = ? WHERE id = ?', [name, id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }
        res.json({ id, name });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'El nombre de la estación ya existe.' });
        }
        res.status(500).json({ error: 'Could not update station' });
    }
});

app.delete('/api/stations/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;

    // Check if any barber is assigned to this station
    const barber = await db.get('SELECT id FROM barbers WHERE station_id = ?', id);
    if (barber) {
        return res.status(400).json({ error: 'No se puede eliminar la estación porque está asignada a un barbero.' });
    }

    const result = await db.run('DELETE FROM stations WHERE id = ?', id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Station not found' });
    }
    res.status(204).send();
});

// Services
app.get('/api/services', async (req, res) => {
    const db = await dbPromise;
    const services = await db.all('SELECT * FROM services ORDER BY name');
    res.json(services);
});

app.post('/api/services', async (req, res) => {
    const db = await dbPromise;
    const { name, price } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' });
    }
    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    const result = await db.run('INSERT INTO services (name, price) VALUES (?, ?)', [name, price]);
    res.status(201).json({ id: result.lastID, name, price });
});

app.put('/api/services/:id', async (req, res) => {
    const db = await dbPromise;
    const { name, price } = req.body;
    const { id } = req.params;
    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' });
    }
    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    const result = await db.run('UPDATE services SET name = ?, price = ? WHERE id = ?', [name, price, id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ id, name, price });
});

app.delete('/api/services/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;

    const sale = await db.get('SELECT id FROM sales WHERE service_id = ?', id);
    if (sale) {
        return res.status(400).json({ error: 'No se puede eliminar el servicio porque está asociado a una venta.' });
    }

    const result = await db.run('DELETE FROM services WHERE id = ?', id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
    }
    res.status(204).send();
});

// Sales
app.get('/api/sales', async (req, res) => {
    const db = await dbPromise;
    const sales = await db.all(`
        SELECT 
            s.id, s.sale_date, s.total_amount, s.customer_name, 
            b.name as barber_name, st.name as station_name
        FROM sales s
        JOIN barbers b ON s.barber_id = b.id
        JOIN stations st ON s.station_id = st.id
        ORDER BY s.sale_date DESC
    `);
    res.json(sales);
});

app.post('/api/sales', async (req, res) => {
    const db = await dbPromise;
    const { sale_date, barber_id, station_id, services, total_amount, customer_name } = req.body;

    // Validation
    if (!sale_date || !barber_id || !station_id || !services || !Array.isArray(services) || services.length === 0 || total_amount === undefined) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    try {
        await db.run('BEGIN TRANSACTION');

        const saleResult = await db.run(
            'INSERT INTO sales (sale_date, barber_id, station_id, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)',
            [sale_date, barber_id, station_id, total_amount, customer_name]
        );
        const saleId = saleResult.lastID;

        const stmt = await db.prepare('INSERT INTO sale_items (sale_id, service_id, price_at_sale) VALUES (?, ?, ?)');
        for (const service of services) {
            await stmt.run(saleId, service.id, service.price);
        }
        await stmt.finalize();

        await db.run('COMMIT');
        res.status(201).json({ id: saleId });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Transaction Error:', error);
        res.status(500).json({ error: 'Failed to record sale.' });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    const db = await dbPromise;
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
    }

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    try {
        // 1. Get calendar events (total sales per day)
        const calendarEvents = await db.all(`
            SELECT 
                strftime('%Y-%m-%d', sale_date) as date,
                SUM(total_amount) as total
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY date
        `, startDate, endDate);

        const events = calendarEvents.map(e => ({
            title: `S/ ${e.total.toFixed(2)}`,
            start: e.date,
            allDay: true
        }));

        // 2. Get barber payment stats
        const barbers = await db.all('SELECT id, name, base_salary FROM barbers');
        const salesByBarber = await db.all(`
            SELECT barber_id, SUM(total_amount) as total_generated
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY barber_id
        `, startDate, endDate);

        const stats = barbers.map(barber => {
            const saleInfo = salesByBarber.find(s => s.barber_id === barber.id);
            const total_generated = saleInfo ? saleInfo.total_generated : 0;
            let payment = barber.base_salary;

            if (total_generated > barber.base_salary) {
                payment = total_generated * 0.5;
            }

            return {
                barber_id: barber.id,
                barber_name: barber.name,
                base_salary: barber.base_salary,
                total_generated: total_generated,
                payment: payment
            };
        });

        res.json({ events, stats });

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});


// Start Server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
