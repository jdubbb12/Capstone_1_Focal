<<<<<<< Updated upstream
/*

    index.ts - The main entry point into the backend.
    Requires a configured environment file to properly function.

 */

// Libraries required to actually start the server and begin listening for HTTP requests and do processing.
import Express from "express";
//import type { Response, Request } from "express"; Unused at the moment.
import 'dotenv/config';
import cors from "cors";
import authentication from "./routes/auth.js";

const PORT = process.env.PORT;

// If we cant find PORT for whatever reason, we need to stop now and fix this, otherwise we will have uncaught exceptions later.
if (PORT === undefined) {
    throw new Error(`[ERROR}\tEnvironment file cannot be read! Please ensure the file exists or the server has proper permissions to read the file.`)
}

// Using Express for request and response handling, CORS to interact with our frontend, JSON to store and transfer credentials, and the API pathway to authentication.
const focalSrv = Express();
focalSrv.use(cors());
focalSrv.use(Express.json());
focalSrv.use("/api/auth", authentication);

// The last step, our server is setup and now ready to accept connections.
focalSrv.listen(PORT, () => {
    console.log(`[SERVER]\tServer is listening on http://localhost:${PORT}`);
});

export default focalSrv;
=======
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
>>>>>>> Stashed changes
