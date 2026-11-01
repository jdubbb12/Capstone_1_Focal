// Dedicated DEVELOPMENT cluster only. Never reads or changes the Windows PG service.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const action = process.argv[2];
if (!['init', 'start', 'stop', 'status'].includes(action)) {
  console.error('Usage: local-db.mjs init|start|stop|status');
  process.exit(1);
}
const root = fileURLToPath(new URL('..', import.meta.url));
const local = path.join(root, '.local');
const data = path.join(local, 'postgres');
const configFile = path.join(local, 'database.json');
const envFile = path.join(root, '.env');
const bin = (name) => process.env.PG_BIN ? path.join(process.env.PG_BIN, name) : name;
function run(name, args, allowFailure = false) {
  const result = spawnSync(bin(name), args, { encoding: 'utf8', windowsHide: true,
    // Windows postgres may inherit pipes from pg_ctl; file handles avoid a hung parent.
    stdio: name === 'pg_ctl' && args.includes('start') ? ['ignore', 'ignore', 'ignore'] : 'pipe',
    timeout: 60000 });
  if (result.error) throw new Error(`Cannot run ${name}. Install PostgreSQL and add its bin directory to PATH or set PG_BIN.`);
  if (!allowFailure && result.status !== 0) {
    // Tool diagnostics contain no database password; passwords go through a temporary file.
    throw new Error(`${name} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}
function start() {
  if (run('pg_ctl', ['-D', data, 'status'], true).status !== 0) {
    run('pg_ctl', ['-D', data, '-l', path.join(local, 'postgres.log'), '-w', 'start']);
  }
}
async function main() {
  if (action === 'init') {
    if (!existsSync(configFile)) {
      if (existsSync(envFile) || existsSync(data)) {
        throw new Error('Existing .env or PostgreSQL directory found. Refusing to overwrite; use your own DATABASE_URL or inspect .local first.');
      }
      mkdirSync(local, { recursive: true });
      const password = randomBytes(32).toString('hex');
      const pwfile = path.join(local, 'init-password');
      writeFileSync(pwfile, password, { mode: 0o600, flag: 'wx' });
      try {
        run('initdb', ['-D', data, '-U', 'focal_local_admin', '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C', `--pwfile=${pwfile}`]);
      } finally { rmSync(pwfile, { force: true }); }
      writeFileSync(path.join(data, 'postgresql.auto.conf'), "listen_addresses = '127.0.0.1'\nport = 55432\n");
      const base = `postgresql://focal_local_admin:${password}@127.0.0.1:55432/`;
      writeFileSync(configFile, JSON.stringify({ adminUrl: base + 'postgres' }), { mode: 0o600, flag: 'wx' });
      writeFileSync(envFile, `NODE_ENV=development\nHOST=127.0.0.1\nPORT=3000\nCLIENT_ORIGIN=http://localhost:5173\nDATABASE_URL=${base}focal_development\nTEST_DATABASE_URL=${base}focal_test\nSESSION_IDLE_MINUTES=30\nSESSION_MAX_HOURS=24\n`, { mode: 0o600, flag: 'wx' });
    }
    start();
    const { adminUrl } = JSON.parse(readFileSync(configFile, 'utf8'));
    const client = new pg.Client({ connectionString: adminUrl });
    try {
      await client.connect();
      for (const database of ['focal_development', 'focal_test']) {
        const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
        // These identifiers are fixed literals, never user input.
        if (!found.rowCount) await client.query(`CREATE DATABASE ${database}`);
      }
    } finally { await client.end(); }
    console.log('Local PostgreSQL ready at 127.0.0.1:55432. Created focal_development and focal_test; credentials are in ignored .env.');
  } else {
    if (!existsSync(configFile)) throw new Error('Run npm run db:local:init first.');
    if (action === 'start') { start(); console.log('Local PostgreSQL started at 127.0.0.1:55432.'); }
    if (action === 'stop') { run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']); console.log('Local PostgreSQL stopped; data preserved.'); }
    if (action === 'status') {
      const result = run('pg_ctl', ['-D', data, 'status'], true);
      console.log(result.status === 0 ? 'Local PostgreSQL is running at 127.0.0.1:55432.' : 'Local PostgreSQL is stopped.');
    }
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
