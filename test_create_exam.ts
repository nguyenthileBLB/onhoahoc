import { randomUUID, randomBytes } from 'crypto';
import db from './db';

try {
  const id = randomUUID();
  const code = randomBytes(3).toString('hex').toUpperCase();
  const admin_token = randomUUID();
  const title = "Test Exam";
  const duration_minutes = 60;
  const answer_key = { p1_q1: "A" };
  const password = "123";

  console.log('Inserting exam...');
  const stmt = db.prepare(`
    INSERT INTO exams (id, code, admin_token, title, duration_minutes, answer_key, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, code, admin_token, title, duration_minutes, JSON.stringify(answer_key), password);
  console.log('Exam inserted successfully:', { id, code });
} catch (e) {
  console.error('Error creating exam:', e);
}
