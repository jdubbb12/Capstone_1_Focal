import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { migrate } from '../src/db/migrate.js';
import pg from 'pg';
import { afterAll, describe, expect, it } from 'vitest';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must name a dedicated database ending in _test.');
const pool = new pg.Pool({ connectionString: url });
afterAll(() => pool.end());
describe('PostgreSQL migrations', () => {
  it('refuses a changed migration checksum', async () => {
    await migrate(pool);
    const before = (await pool.query('SELECT checksum FROM schema_migrations WHERE name = $1', ['001_initial.sql'])).rows[0].checksum;
    try {
      await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE name = $2', ['0'.repeat(64), '001_initial.sql']);
      await expect(migrate(pool)).rejects.toThrow('changed after application');
    } finally {
      await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE name = $2', [before, '001_initial.sql']);
    }
  });
  it('rolls back both DDL and the migration record when SQL fails', async () => {
    await mkdir(resolve('.local'), { recursive: true });
    const directory = await mkdtemp(resolve('.local', 'migration-test-'));
    try {
      await writeFile(resolve(directory, '999_broken.sql'), 'CREATE TABLE migration_rollback_probe (id integer); SELECT missing_probe_column;');
      await expect(migrate(pool, pathToFileURL(directory + sep))).rejects.toThrow();
      const probe = await pool.query("SELECT to_regclass('migration_rollback_probe') AS table_name");
      expect(probe.rows[0].table_name).toBeNull();
      expect((await pool.query("SELECT count(*)::int AS n FROM schema_migrations WHERE name = '999_broken.sql'")).rows[0].n).toBe(0);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
  it('creates the requirements-based schema and can be rerun without data loss', async () => {
    const cli = fileURLToPath(new URL('../src/db/migrate-cli.ts', import.meta.url));
    const migrate = () => spawnSync(process.execPath, ['--import', 'tsx', cli], {
      env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', timeout: 20000,
    });
    const first = migrate();
    expect(first.status, first.stderr).toBe(0);
    const second = migrate();
    expect(second.status, second.stderr).toBe(0);
    const { rows } = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    expect(rows.map(r => r.tablename)).toEqual(expect.arrayContaining([
      'users', 'sessions', 'artworks', 'revisions', 'comments', 'boards', 'board_items',
      'interests', 'user_interests', 'artwork_interests', 'reports', 'schema_migrations',
    ]));
    expect((await pool.query('SELECT count(*)::int AS n FROM schema_migrations')).rows[0].n).toBe(1);
    expect((await pool.query('SELECT count(*)::int AS n FROM interests')).rows[0].n).toBeGreaterThan(0);
  });
});
