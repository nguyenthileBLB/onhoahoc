import Database from 'better-sqlite3';

const db = new Database('exam.db');

// Enable foreign keys and WAL mode for concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    admin_token TEXT NOT NULL,
    title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    answer_key JSON NOT NULL,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    submit_time DATETIME,
    answers JSON,
    score REAL,
    score_details JSON,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
  );
`);

// Attempt to add password column if it doesn't exist (migration for existing db)
try {
  db.exec("ALTER TABLE exams ADD COLUMN password TEXT");
} catch (e) {
  // Column likely exists or other error we can ignore for now
}

export default db;
