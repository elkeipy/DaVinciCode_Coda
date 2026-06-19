import pg from 'pg';
import { loadEnv } from './load-env.mjs';

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

try {
  const result = await pool.query('SELECT current_database() AS db, current_user AS user');
  const row = result.rows[0];
  console.log(`OK: connected as ${row.user} to ${row.db}`);
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  if (tables.rowCount === 0) {
    console.log('Tables: (none) — run npm run db:push');
  } else {
    console.log('Tables:', tables.rows.map((r) => r.table_name).join(', '));
  }
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
