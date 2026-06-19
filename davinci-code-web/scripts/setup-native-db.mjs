import pg from 'pg';
import { loadEnv } from './load-env.mjs';

const APP_USER = 'davinci';
const APP_PASSWORD = 'davinci';
const APP_DATABASE = 'davinci_dev';

loadEnv();

const adminUrl = process.env.POSTGRES_ADMIN_URL;
if (!adminUrl) {
  console.error('POSTGRES_ADMIN_URL is not set in .env');
  console.error('Example: postgresql://postgres:YOUR_INSTALL_PASSWORD@localhost:5432/postgres');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: adminUrl });

async function roleExists(client, name) {
  const result = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [name]);
  return result.rowCount > 0;
}

async function databaseExists(client, name) {
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  return result.rowCount > 0;
}

async function main() {
  const client = await pool.connect();
  try {
    if (!(await roleExists(client, APP_USER))) {
      await client.query(`CREATE ROLE ${APP_USER} LOGIN PASSWORD '${APP_PASSWORD}'`);
      console.log(`Created role: ${APP_USER}`);
    } else {
      await client.query(`ALTER ROLE ${APP_USER} WITH PASSWORD '${APP_PASSWORD}'`);
      console.log(`Role exists, password reset: ${APP_USER}`);
    }
    if (!(await databaseExists(client, APP_DATABASE))) {
      await client.query(`CREATE DATABASE ${APP_DATABASE} OWNER ${APP_USER}`);
      console.log(`Created database: ${APP_DATABASE}`);
    } else {
      console.log(`Database exists: ${APP_DATABASE}`);
    }
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${APP_DATABASE} TO ${APP_USER}`);
    console.log('Done.');
    console.log(`DATABASE_URL=postgresql://${APP_USER}:${APP_PASSWORD}@localhost:5432/${APP_DATABASE}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
