const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Сохранение прогресса
app.post('/api/save', (req, res) => {
    const { telegram_id, save_data, username, first_name, last_name } = req.body;
    
    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id required' });
    }
    
    // Сохраняем или обновляем игрока
    db.run(
        `INSERT OR REPLACE INTO players (telegram_id, username, first_name, last_name, created_at) 
         VALUES (?, ?, ?, ?, strftime('%s', 'now'))`,
        [telegram_id, username, first_name, last_name]
    );
    
    // Сохраняем данные игры
    db.run(
        `INSERT OR REPLACE INTO saves (telegram_id, save_data, updated_at) 
         VALUES (?, ?, strftime('%s', 'now'))`,
        [telegram_id, JSON.stringify(save_data)]
    );
    
    res.json({ success: true, message: 'Progress saved' });
});

// Загрузка прогресса
app.post('/api/load', (req, res) => {
    const { telegram_id } = req.body;
    
    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id required' });
    }
    
    db.get(`SELECT save_data FROM saves WHERE telegram_id = ?`, [telegram_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            res.json({ success: true, save_data: JSON.parse(row.save_data) });
        } else {
            res.json({ success: true, save_data: null });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});