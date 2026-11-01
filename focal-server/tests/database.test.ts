import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { migrate } from '../src/db/migrate.js';
import pg from 'pg';
import { afterAll, describe, expect, it } from 'vitest';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must name a dedicated database ending in _test.');
const databaseIdentity = (value: string) => {
  const parsed = new URL(value);
  return `${parsed.hostname.toLowerCase()}:${parsed.port || '5432'}${decodeURIComponent(parsed.pathname)}`;
};
if (process.env.DATABASE_URL && databaseIdentity(url) === databaseIdentity(process.env.DATABASE_URL)) {
  throw new Error('Test and development databases must be different.');
}
const pool = new pg.Pool({ connectionString: url });
afterAll(() => pool.end());

// Every synthetic migration owns a schema and directory. Never change the real
// public.schema_migrations records, even while testing checksum rejection.
async function withMigrationFixture(run: (fixture: { pool: pg.Pool; directory: URL; write: (name: string, sql: string) => Promise<void> }) => Promise<void>) {
  await mkdir(resolve('.local'), { recursive: true });
  const directory = await mkdtemp(resolve('.local', 'migration-test-'));
  const schema = `migration_test_${randomUUID().replaceAll('-', '')}`;
  const fixturePool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}` });
  try {
    await pool.query(`CREATE SCHEMA ${schema}`);
    await run({
      pool: fixturePool,
      directory: pathToFileURL(directory + sep),
      write: (name, sql) => writeFile(resolve(directory, name), sql),
    });
  } finally {
    await fixturePool.end();
    try { await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); }
    finally { await rm(directory, { recursive: true, force: true }); }
  }
}

const fixtureName = '001_fixture.sql';
const fixtureSql = 'CREATE TABLE migration_probe (id integer PRIMARY KEY, value text NOT NULL);\nINSERT INTO migration_probe VALUES (1, \'original\');\n';
const migrationRecords = (fixturePool: pg.Pool) => fixturePool.query('SELECT name, checksum, applied_at::text FROM schema_migrations ORDER BY name');
const probeData = (fixturePool: pg.Pool) => fixturePool.query('SELECT * FROM migration_probe ORDER BY id');

describe('PostgreSQL migrations', () => {
  it('accepts an LF migration checked out as CRLF without changing applied records or data', async () => {
    await withMigrationFixture(async ({ pool, directory, write }) => {
      await write(fixtureName, fixtureSql);
      expect(await migrate(pool, directory)).toEqual([fixtureName]);
      await pool.query("INSERT INTO migration_probe VALUES (2, 'keep me')");
      const records = (await migrationRecords(pool)).rows;
      const data = (await probeData(pool)).rows;
      await write(fixtureName, fixtureSql.replaceAll('\n', '\r\n'));

      await expect(migrate(pool, directory)).resolves.toEqual([]);
      expect((await migrationRecords(pool)).rows).toEqual(records);
      expect((await probeData(pool)).rows).toEqual(data);
    });
  });

  it.each(['LF', 'CRLF'])('accepts a legacy raw CRLF checksum with a %s checkout without rewriting records or data', async (lineEndings) => {
    await withMigrationFixture(async ({ pool, directory, write }) => {
      const legacySql = fixtureSql.replaceAll('\n', '\r\n');
      // Reproduce a pre-canonicalization installation only in this private schema.
      await pool.query(`CREATE TABLE schema_migrations (
        name text PRIMARY KEY, checksum char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(legacySql);
      await pool.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [
        fixtureName, createHash('sha256').update(legacySql).digest('hex'),
      ]);
      await pool.query("INSERT INTO migration_probe VALUES (2, 'keep me')");
      const records = (await migrationRecords(pool)).rows;
      const data = (await probeData(pool)).rows;
      await write(fixtureName, lineEndings === 'LF' ? fixtureSql : legacySql);

      await expect(migrate(pool, directory)).resolves.toEqual([]);
      expect((await migrationRecords(pool)).rows).toEqual(records);
      expect((await probeData(pool)).rows).toEqual(data);
    });
  });

  it('stores an LF checksum for a new CRLF migration and accepts a later LF checkout', async () => {
    await withMigrationFixture(async ({ pool, directory, write }) => {
      await write(fixtureName, fixtureSql.replaceAll('\n', String.fromCharCode(13, 10)));
      expect(await migrate(pool, directory)).toEqual([fixtureName]);
      const records = (await migrationRecords(pool)).rows;
      const data = (await probeData(pool)).rows;
      expect(records[0].checksum).toBe(createHash('sha256').update(fixtureSql).digest('hex'));
      await write(fixtureName, fixtureSql);

      await expect(migrate(pool, directory)).resolves.toEqual([]);
      expect((await migrationRecords(pool)).rows).toEqual(records);
      expect((await probeData(pool)).rows).toEqual(data);
    });
  });

  it.each(['LF', 'CRLF'])('refuses actual SQL changes against a %s checksum without changing applied records or data', async (lineEndings) => {
    await withMigrationFixture(async ({ pool, directory, write }) => {
      const appliedSql = lineEndings === 'LF' ? fixtureSql : fixtureSql.replaceAll('\n', String.fromCharCode(13, 10));
      await pool.query(`CREATE TABLE schema_migrations (
        name text PRIMARY KEY, checksum char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(appliedSql);
      await pool.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [
        fixtureName, createHash('sha256').update(appliedSql).digest('hex'),
      ]);
      const records = (await migrationRecords(pool)).rows;
      const data = (await probeData(pool)).rows;
      await write(fixtureName, fixtureSql.replace('original', 'changed').replaceAll('\n', '\r\n'));

      await expect(migrate(pool, directory)).rejects.toThrow('changed after application');
      expect((await migrationRecords(pool)).rows).toEqual(records);
      expect((await probeData(pool)).rows).toEqual(data);
    });
  });

  it('rolls back both DDL and the migration record when SQL fails', async () => {
    await withMigrationFixture(async ({ pool, directory, write }) => {
      await write('999_broken.sql', 'CREATE TABLE migration_rollback_probe (id integer); SELECT missing_probe_column;');
      await expect(migrate(pool, directory)).rejects.toThrow();
      const probe = await pool.query("SELECT to_regclass('migration_rollback_probe') AS table_name");
      expect(probe.rows[0].table_name).toBeNull();
      expect((await pool.query("SELECT count(*)::int AS n FROM schema_migrations WHERE name = '999_broken.sql'")).rows[0].n).toBe(0);
    });
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
