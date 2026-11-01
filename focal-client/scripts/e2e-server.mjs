// Test-only server: never points at the development database.
import { config } from 'dotenv';
import { requireTestDatabase } from './test-database.mjs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const server = fileURLToPath(new URL('../../focal-server/', import.meta.url));
config({ path: fileURLToPath(new URL('../../focal-server/.env', import.meta.url)), quiet: true });
const url = requireTestDatabase(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
const env = { ...process.env, NODE_ENV: 'development', DATABASE_URL: url, HOST: '127.0.0.1', PORT: '3001', CLIENT_ORIGIN: 'http://localhost:5174' };
const migrated = spawnSync(process.execPath, ['--import', 'tsx', 'src/db/migrate-cli.ts'], { cwd: server, env, stdio: 'inherit', timeout: 30000 });
if (migrated.status !== 0) process.exit(1);
const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], { cwd: server, env, stdio: 'inherit' });
child.on('error', () => { console.error('Cannot start the isolated E2E backend.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
