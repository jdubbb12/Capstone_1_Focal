import 'dotenv/config';
import pg from 'pg';
import { migrate } from './migrate.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Copy .env.example to .env, or run npm run db:local:init.');
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  const files = await migrate(pool);
  console.log(files.length ? `Applied: ${files.join(', ')}` : 'Database is up to date.');
} catch (error) {
  // Avoid printing connection strings or arbitrary server diagnostics.
  console.error('Migration failed:', error instanceof Error ? error.message : 'unknown database error');
  process.exitCode = 1;
} finally { await pool.end(); }
