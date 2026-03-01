import db from './db';

try {
  const info = db.pragma('table_info(exams)');
  console.log('Exams table columns:', info);
} catch (e) {
  console.error('Error checking table info:', e);
}
