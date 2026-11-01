import 'dotenv/config';
import pg from 'pg';
import { createApp } from './app.js';
import { readConfig } from './config.js';

async function main() {
  const config = readConfig(process.env);
  const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10,
    connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000, query_timeout: 10000, statement_timeout: 10000 });
  pool.on('error', () => console.error(JSON.stringify({ event: 'database_pool_error' })));
  try {
    await pool.query('SELECT user_id FROM users LIMIT 0');
  } catch {
    await pool.end();
    throw new Error('Database is unavailable or migrations are missing. Start PostgreSQL and run npm run db:migrate.');
  }
  const app = createApp({ pool, config });
  const server = app.listen(config.port, config.host, () => {
    console.log(`Focal API listening on http://${config.host}:${config.port}`);
  });
  server.on('error', async () => {
    console.error('Could not listen on the configured host/port. Check for an existing server.');
    await pool.end();
    process.exitCode = 1;
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  let closing = false;
  function shutdown() {
    if (closing) return;
    closing = true;
    const deadline = setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 10000);
    deadline.unref();
    server.close(async () => {
      await pool.end();
      clearTimeout(deadline);
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Server startup failed.');
  process.exitCode = 1;
});
