const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// База данных прямо здесь
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS saves (telegram_id TEXT PRIMARY KEY, save_data TEXT, updated_at INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS coins (telegram_id TEXT PRIMARY KEY, coins INTEGER, updated_at INTEGER)`);
    console.log('✅ Database ready');
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Shooter Backend running' });
});

// Сохранение прогресса
app.post('/api/save', (req, res) => {
    const { telegram_id, save_data } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
    
    db.run(`INSERT OR REPLACE INTO saves (telegram_id, save_data, updated_at) VALUES (?, ?, strftime('%s', 'now'))`, 
        [telegram_id, JSON.stringify(save_data)], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// Загрузка прогресса
app.post('/api/load', (req, res) => {
    const { telegram_id } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
    
    db.get(`SELECT save_data FROM saves WHERE telegram_id = ?`, [telegram_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, save_data: row ? JSON.parse(row.save_data) : null });
    });
});

// Сохранение монет
app.post('/api/coins', (req, res) => {
    const { telegram_id, coins } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
    
    if (coins !== undefined) {
        db.run(`INSERT OR REPLACE INTO coins (telegram_id, coins, updated_at) VALUES (?, ?, strftime('%s', 'now'))`, 
            [telegram_id, coins], 
            (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
    } else {
        db.get(`SELECT coins FROM coins WHERE telegram_id = ?`, [telegram_id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, coins: row ? row.coins : 100 });
        });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
});