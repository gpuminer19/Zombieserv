const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'game.db'));

// Создаём таблицы
db.serialize(() => {
    // Таблица игроков
    db.run(`
        CREATE TABLE IF NOT EXISTS players (
            telegram_id TEXT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);
    
    // Таблица сохранений
    db.run(`
        CREATE TABLE IF NOT EXISTS saves (
            telegram_id TEXT PRIMARY KEY,
            save_data TEXT NOT NULL,
            updated_at INTEGER DEFAULT (strftime('%s', 'now')),
            FOREIGN KEY (telegram_id) REFERENCES players(telegram_id)
        )
    `);
});

module.exports = db;