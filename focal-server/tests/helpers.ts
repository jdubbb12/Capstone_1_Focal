import 'dotenv/config';
import pg from 'pg';
import { migrate } from '../src/db/migrate.js';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must name a dedicated database ending in _test.');
if (url === process.env.DATABASE_URL) throw new Error('Test and development databases must be different.');
export const pool = new pg.Pool({ connectionString: url });
export const config = {
  nodeEnv: 'test' as const, host: '127.0.0.1', port: 3000,
  clientOrigin: 'http://localhost:5173', databaseUrl: url,
  sessionIdleMinutes: 30, sessionMaxHours: 24, trustProxyHops: 0, authRateLimit: 100,
};
export async function setupDatabase() { await migrate(pool); }
export async function clearUsers() { await pool.query('TRUNCATE users RESTART IDENTITY CASCADE'); }
export const account = {
  email: 'elisa@example.com', username: 'elisa', password: 'test password with 20+ chars',
  first_name: 'Elisa', last_name: 'Arbaiza', creative_role: '2d_artist',
};
