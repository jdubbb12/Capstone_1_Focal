import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import type { Pool } from 'pg';

// A session-level advisory lock serializes migration runners. Each SQL file and
// its checksum record commit together, so failed migrations are retryable.
export async function migrate(pool: Pool, directory = new URL('../../migrations/', import.meta.url)) {
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query('SELECT pg_advisory_lock(51420517)');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum char(64) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    const files = (await readdir(directory)).filter(f => /^\d+_[a-z0-9_]+\.sql$/.test(f)).sort();
    if (!files.length) throw new Error('No migration SQL files found.');
    for (const name of files) {
      const sql = await readFile(new URL(name, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name = $1', [name]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`Migration ${name} changed after application. Add a new migration instead.`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1,$2)', [name, checksum]);
        await client.query('COMMIT');
        applied.push(name);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return applied;
  } finally {
    try { await client.query('SELECT pg_advisory_unlock(51420517)'); }
    finally { client.release(); }
  }
}
