import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

export function getDb() {
  if (!db) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function checkDbConnection(): Promise<boolean> {
  const client = new Pool({ connectionString: getDatabaseUrl() });
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    await client.end();
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
