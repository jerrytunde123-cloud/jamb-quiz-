const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './utme.db');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  optionA TEXT NOT NULL,
  optionB TEXT NOT NULL,
  optionC TEXT NOT NULL,
  optionD TEXT NOT NULL,
  correct INTEGER NOT NULL,   -- 0..3
  year TEXT,
  image TEXT
);
CREATE INDEX IF NOT EXISTS idx_subject ON questions(subject);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_taken INTEGER,
  nickname TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER,
  subject TEXT,
  name TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT UNIQUE,
  count INTEGER DEFAULT 0
);
`);

module.exports = db;
